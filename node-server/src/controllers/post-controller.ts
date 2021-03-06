import { ControllerBase } from "./controller-base";
import * as core from "express-serve-static-core";
import { Connection } from "mysql";
import { Post } from "../models/post";
import moment from "moment";

export class PostController extends ControllerBase {
  constructor(protected connection: Connection) {
    super(connection);
  }

  addPost(req: core.Request, res: core.Response) {
    const post: Post = {
      Content: req.body.content,
      UserId: req.body.userId,
      CreatedTimeStamp: moment().utc().toString()
    };

    this.connection.query({
        sql: "INSERT INTO POSTS SET ?",
        values: [post],
      },
      (err, rows) => this.sendResponse(err, {}, res)
    );
  }

  updatePost(req: core.Request, res: core.Response) {
    const post = {
      Content: req.body.content,
    };

    this.connection.query({
        sql: "UPDATE POSTS SET ? WHERE Id = ?",
        values: [post, req.body.id],
      },
      (err, rows) => this.sendResponse(err, {}, res)
    );
  }

  getPostsByUserId(userId: number, onlySelf: boolean, res: core.Response) {
    let query = `
      SELECT Id, Content, UserId, CreatedTimeStamp
      FROM Posts p
    `;

    if (onlySelf === true) {
      query += `
        WHERE p.UserId = ${userId}
      `;
    } else {
      query += `
        WHERE p.UserId IN (
          SELECT DISTINCT followingUserId FROM Followers WHERE userId = ${userId}
        )
      `;
    }

    query += `
      ORDER BY p.CreatedTimeStamp DESC
    `

    this.connection.query({
      sql: query,
      values: [userId],
    }, (err, rows) => this.sendResponse(err, rows, res)
    );
  }

  deletePost(postId: number, res: core.Response) {
    this.connection.query({
        sql: "DELETE FROM Posts WHERE Id = ?",
        values: [postId],
      },
      (err, rows) => this.sendResponse(err, {}, res)
    );
  }
}
