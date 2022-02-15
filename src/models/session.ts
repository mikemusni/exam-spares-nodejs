import { model, Schema } from "mongoose";
import { v4 as uuid } from "uuid";
import moment from "moment";

export interface ISession {
  _doc?: any;
  userId?: Schema.Types.ObjectId;
  username?: string;
  permission?: string;
  token?: string;
  dateCreated?: string;
}

const Sessions = model<ISession>(
  "Sessions",
  new Schema(
    {
      userId: { type: Schema.Types.ObjectId, require: true },
      username: { type: String, require: true, default: null },
      permission: { type: String, require: true, default: null },
      token: { type: String, require: true, default: null },
      dateCreated: { type: String, require: true },
    },
    {
      versionKey: false,
    }
  )
);

/* session module */
export const create = async (body: ISession) => {
  let token = uuid();
  let query = {
    $and: [
      {
        username: body.username,
      },
      {
        token: token,
      },
    ],
  };
  body = {
    ...body,
    token,
    dateCreated: moment().format("YYYY-MM-DD HH:mm:ss"),
  };

  return await Sessions.findOneAndUpdate(
    query,
    {
      $set: body,
    },
    {
      upsert: true,
      new: true,
    }
  )
    .then((resp: ISession) => {
      delete resp._doc._id;
      return resp;
    })
    .catch((err) => {
      console.log(err);
      return false;
    });
};
export const validate = async (token: string) => {
  let query = { token };

  return await Sessions.findOne(query)
    .then((resp: ISession) => {
      if (resp !== null) {
        return resp;
      } else {
        return false;
      }
    })
    .catch((err) => {
      console.log(err);
      return false;
    });
};
export const remove = async (token: string) => {
  let query = { token };

  return await Sessions.deleteOne(query)
    .then((resp) => {
      return Boolean(resp.deletedCount);
    })
    .catch((err) => {
      console.log(err);
      return false;
    });
};

/* cron jobs */
// setTimeout(() => {
//   // 1 hour
//   Sessions.deleteMany({
//     dateCreated: {
//       $lt: moment().add(1, "h").format("YYYY-MM-DD HH:mm:ss"),
//     },
//   }).exec();
// }, 60000);
/* end of cron jobs */
