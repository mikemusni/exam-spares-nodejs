import mongoose, { model, Schema, PipelineStage } from "mongoose";
import moment from "moment";
import * as constant from "../constants";

export interface IProduct {
  _id?: any;
  brand?: string;
  name?: any;
  category?: string;
  pictureCode?: string;
  carMake?: string;
  description?: string;
  partNumber?: string;
  position?: string;
  price?: Number;
  infos?: any;
  updatedDate?: string;
  updatedBy?: Schema.Types.ObjectId;
  isFeatured?: boolean;
  isPopular?: boolean;
  isView?: boolean;
  page?: number;
  search?: string;
  sort?: string;
  orderBy?: string;
  showcase?: string;
  size?: number;
}

interface Generic {
  [key: string]: any;
}

const Products = model<IProduct>(
  "Products",
  new Schema(
    {
      brand: { type: String, require: true, default: null },
      name: { type: String, require: true, default: null },
      category: { type: String, require: true, default: null },
      pictureCode: { type: String, require: true, default: null },
      carMake: { type: String, require: true, default: null },
      description: { type: String, require: true, default: null },
      partNumber: { type: String, require: true, default: null },
      position: { type: String, require: true, default: null },
      price: { type: Number, require: true, default: null },
      isFeatured: { type: Boolean, require: true, default: null },
      isPopular: { type: Boolean, require: true, default: null },
      isView: { type: Boolean, require: true, default: null },
      infos: {},
      updatedDate: { type: String, require: true, default: null },
      updatedBy: { type: Schema.Types.ObjectId, require: true, default: null },
    },
    {
      versionKey: false,
    }
  )
);

const pageLimit: number = 50;
export const update = async (body: IProduct) => {
  const dateNow = moment().format("YYYY-MM-DD HH:mm:ss");
  let query: IProduct = {};
  if (body._id) {
    query = { _id: body._id };
    body = {
      ...body,
      updatedDate: dateNow,
    };
  } else {
    body = {
      ...body,
      updatedDate: dateNow,
    };
  }

  return await Products.updateOne(
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
export const isNameExist = async (body: IProduct) => {
  let query: Generic = {
    $and: [{ name: body.name }],
  };
  if (body._id) {
    query = {
      $and: [
        {
          _id: {
            $ne: body._id,
          },
        },
        { name: body.name },
      ],
    };
  }

  return await Products.findOne(query, {
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
export const isIdExist = async (body: IProduct) => {
  let query = {
    $and: [{ _id: body._id }],
  };

  return await Products.aggregate([
    {
      $match: query,
    },
    {
      $project: {
        _id: 1,
        brand: 1,
        category: 1,
        carMake: 1,
        pictureCode: 1,
        description: 1,
        usage: 1,
        infos: 1,
        partNumber: 1,
        position: 1,
        price: 1,
      },
    },
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
export const search = async (body: IProduct) => {
  let query: PipelineStage.Match = {
    $match: {
      $and: [
        { isView: true }, // later change this to dynamic to support backend and frontend
      ],
    },
  };
  query.$match.$and.push({
    $or: [
      { brand: { $regex: `.*${body.search}.*`, $options: "i" } },
      { name: { $regex: `.*${body.search}.*`, $options: "i" } },
      { description: { $regex: `.*${body.search}.*`, $options: "i" } },
      { partNumber: { $regex: `.*${body.search}.*`, $options: "i" } },
    ],
  });

  // add a checker here if the user added these options else, free for all search
  if (body.category) {
    query.$match.$and.push({
      category: body.category,
    });
  }
  if (body.carMake) {
    query.$match.$and.push({
      carMake: body.carMake,
    });
  }

  let sort: PipelineStage.Sort = {
    $sort: {
      [body.sort]: body.orderBy === constant.sortTypes.ASCENDING ? 1 : -1,
    },
  };
  return await Products.aggregate([
    query,
    sort,
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
        collection: {
          _id: 1,
          brand: 1,
          category: 1,
          carMake: 1,
          pictureCode: 1,
          description: 1,
          usage: 1,
          infos: 1,
          partNumber: 1,
          position: 1,
          price: 1,
        },
        total: 1,
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
export const category = async (body: { [type: string]: string }) => {
  return await Products.aggregate([
    {
      $group: {
        _id: `$${body.type}`,
      },
    },
    {
      $sort: {
        _id: 1,
      },
    },
    {
      $group: {
        _id: 1,
        collection: {
          $push: "$$ROOT._id",
        },
      },
    },
    {
      $project: {
        _id: 0,
        collection: {
          $filter: {
            input: "$collection",
            as: "c",
            cond: {
              $ne: ["$$c", null],
            },
          },
        },
      },
    },
  ])
    .then((result) => {
      if (result[0].collection.length) {
        return result[0].collection;
      }
    })
    .catch((err) => {
      console.log(err);
      return false;
    });
};
export const remove = async (body: IProduct) => {
  let query = {
    _id: body._id,
  };
  return await Products.deleteOne(query)
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

export const showcase = async (body: IProduct) => {
  let query = {
    [body.showcase === "featured" ? "isFeatured" : "isPopular"]: true,
  };

  return await Products.aggregate([
    {
      $match: query,
    },
    {
      $sample: {
        size: body.size,
      },
    },
  ])
    .then((value) => {
      if (value.length) {
        return value;
      }
      return false;
    })
    .catch((err) => {
      console.log(err);
      return false;
    });
};
