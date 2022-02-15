import mongoose, { model, Schema, PipelineStage } from "mongoose";
import moment from "moment";
import * as constant from "../constants";

export enum ITypeIncident {
  FEATURE = "feature",
  BUG = "bug",
  TECHNICAL = "technical",
}

export interface IIncident {
  _id?: any;
  title?: string;
  description?: string;
  type?: ITypeIncident;
  comment?: string;
  isResolved?: boolean;
  assignedTo?: any;
  createdBy?: any;
  dateCreated?: string;
  dateUpdated?: string;
  page?: number;
  isViewed?: boolean;
  search?: string;
  sort?: string;
  orderBy?: string;
}

interface Generic {
  [key: string]: any;
}

const Incidents = model<IIncident>(
  "Incidents",
  new Schema(
    {
      title: { type: String, require: true, default: null },
      description: { type: String, require: true, default: null },
      type: { type: String, require: true, default: null },
      comment: { type: String, require: true, default: null },
      isResolved: { type: Boolean, require: true, default: false },
      assignedTo: { type: Schema.Types.ObjectId, require: true, default: null },
      createdBy: { type: Schema.Types.ObjectId, require: true, default: null },
      dateCreated: { type: String, require: true, default: null },
      dateUpdated: { type: String, require: true, default: null },
      isViewed: { type: Boolean, require: true, default: false },
    },
    {
      versionKey: false,
    }
  )
);

const pageLimit: number = 10;
export const update = async (body: IIncident) => {
  const dateNow = moment().format("YYYY-MM-DD HH:mm:ss");
  let query: IIncident = { title: body.title };
  if (body._id) {
    query = { _id: body._id };
    body = {
      ...body,
      dateUpdated: dateNow,
    };
  } else {
    body = {
      ...body,
      dateCreated: dateNow,
      dateUpdated: dateNow,
    };
  }

  return await Incidents.updateOne(
    query,
    {
      $set: body,
    },
    {
      new: true,
      upsert: true,
    }
  )
    .then((value) => {
      if (value) {
        return value;
      }
      return false;
    })
    .catch((err) => {
      console.log(err);
      return false;
    });
};
export const isNameExist = async (body: IIncident) => {
  let query: Generic = {
    $and: [{ title: body.title }],
  };
  if (body._id) {
    query = {
      $and: [
        {
          _id: {
            $ne: body._id,
          },
        },
        { title: body.title },
      ],
    };
  }

  return await Incidents.findOne(query, {
    _id: 1,
    name: 1,
  })
    .then((value) => {
      if (value) {
        return value;
      }
      return false;
    })
    .catch((err) => {
      console.log(err);
      return false;
    });
};
export const isIdExist = async (body: IIncident) => {
  let query = {
    $and: [{ _id: body._id }],
  };

  return await Incidents.aggregate([
    {
      $match: query
    },
    {
        $lookup: {
            from: 'users',
            localField: 'assignedTo',
            foreignField: '_id',
            as: 'assignedUsername'
        }
    }, {
        $lookup: {
            from: 'users',
            localField: 'createdBy',
            foreignField: '_id',
            as: 'createdUsername'
        }
    }, {
        $addFields: {
            assignedUsername: {
                $arrayElemAt: [
                    '$assignedUsername.username',
                    0
                ]
            },
            createdUsername: {
                $arrayElemAt: [
                    '$createdUsername.username',
                    0
                ]
            }
        }
    }
  ])
    .then((value) => {
      if (value.length) {
        return value[0];
      }
      return false;
    })
    .catch((err) => {
      console.log(err);
      return false;
    });
};
export const list = async (body: IIncident) => {
  let query: PipelineStage.Match = {
    $match: {
      $and: [],
    },
  };
  query.$match.$and.push({
    $or: [{ title: { $regex: `.*${body.search}.*`, $options: "i" } }],
  });
  query.$match.$and.push({ type: { $regex: body.type, $options: "i" } });

  let sort: PipelineStage.Sort = {
    $sort: {
      [body.sort]: body.orderBy === constant.sortTypes.ASCENDING ? 1 : -1,
    },
  };

  return await Incidents.aggregate([
    query,
    sort,
    {
      $lookup: {
        from: "users",
        localField: "assignedTo",
        foreignField: "_id",
        as: "assignedUsername",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "createdBy",
        foreignField: "_id",
        as: "createdUsername",
      },
    },
    {
      $addFields: {
        assignedUsername: {
          $arrayElemAt: ["$assignedUsername.username", 0],
        },
        createdUsername: {
          $arrayElemAt: ["$createdUsername.username", 0],
        },
      },
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
export const remove = async (body: IIncident) => {
  let query = {
    _id: body._id,
  };
  return await Incidents.deleteOne(query)
    .then((value) => {
      if (value.deletedCount) {
        return value;
      }
      return false;
    })
    .catch((err) => {
      console.log(err);
      return false;
    });
};
