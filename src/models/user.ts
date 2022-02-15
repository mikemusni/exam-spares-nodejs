import { model, Schema, PipelineStage } from "mongoose";

export interface IUser {
  _id?: Schema.Types.ObjectId;
  username?: string;
  password?: string;
  permission?: string;
  page?: number;
}

const Users = model<IUser>(
  "Users",
  new Schema(
    {
      username: { type: String, require: true, default: null },
      password: { type: String, require: true, default: null },
      permission: { type: String, require: true, default: null },
    },
    {
      versionKey: false,
    }
  )
);

const pageLimit = 10;
export const login = async (body: IUser) => {
  let query = {
    $and: [
      {
        username: { $eq: body.username },
      },
      {
        password: { $eq: body.password },
      },
    ],
  };
  return await Users.findOne(query)
    .then((resp: IUser) => {
      return resp;
    })
    .catch((err) => {
      console.log(err);
      return false;
    });
};

export const list = async (body: IUser) => {
  let query: PipelineStage.Match = {
    $match: {
      $and: [],
    },
  };
  query.$match.$and.push(
    { username: { $regex: `.*${body.username}.*`, $options: "i" } },
    { permission: { $ne: "admin" } }
  );

  return await Users.aggregate([
    query,
    {
      $sort: {
        username: 1
      }
    },
    {
      $project: {
        password: 0
      }
    },
    {
      $group: {
        _id: 1,
        collection: {
          $push: "$$ROOT",
        },
        total: {
          $sum: 1,
        },
      },
    },
    {
      $project: {
        _id: 0,
        collection: {
          $slice: ["$collection", body.page * pageLimit, pageLimit],
        },
        pagination: {
          total: "$total",
        },
      },
    },
  ])
    .then((value) => {
      if (value.length) {
        value[0].pagination["totalPage"] = Math.ceil(
          value[0].pagination.total / pageLimit
        );
        value[0].pagination["page"] = body.page + 1;
        value[0].pagination["limit"] = pageLimit;

        if (value[0].collection.length) {
          return value[0];
        }
        return false;
      }
      return false;
    })
    .catch((err) => {
      console.log(err);
      return false;
    });
};