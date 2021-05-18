require("dotenv").config();
const User = require("../Models/User");
const Role = require("../Models/Role");
const Blog = require("../Models/Blog");
const Recipe = require("../Models/Recipe");
const BlogImage = require("../Models/BlogImage");
const RecipeImage = require("../Models/RecipeImage");
const FavoriteBlog = require("../Models/FavoriteBlog");
const FavoriteRecipe = require("../Models/FavoriteRecipe");
const Comment = require("../Models/Comment");

const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const {
  createToken,
  verifyToken,
  createTokenTime,
  makePassword,
} = require("./index");
class MeController {
  //get me/information / get || post put delete
  async information(req, res, next) {
    try {
      const token = req.get("Authorization").replace("Bearer ", "");
      const _id = await verifyToken(token);
      var resultUser = await User.findOne({ _id, Status: "ACTIVE" }); //muc dich la lay role
      if (resultUser != null) {
        res.status(200).send({
          data: resultUser,
          error: "null",
        });
      } else {
        res.status(404).send({
          data: "",
          error: "Not found user!",
        });
      }
    } catch (error) {
      res.status(500).send({
        data: "",
        error: error,
      });
    }
  }
   //Put me/change-password
   async ChangePassword(req, res, next) {
    try {
      const passwordOld = req.body.PasswordOld;
      const passwordNew = req.body.PasswordNew;
      const confirmPassword = req.body.ConfirmPassword;
      const token = req.get("Authorization").replace("Bearer ", "");
      const _id = await verifyToken(token);
      var result = await User.findOne({ _id, Status: "ACTIVE" });
      if (result != null) {
        const isEqualPassword = await bcrypt.compare(
          passwordOld,
          result.Password
        );
        if (isEqualPassword) {
          if (passwordNew == confirmPassword) {
            const hashPassword = await bcrypt.hash(passwordNew, 5);
            result.Password = hashPassword;
            result.save();
            res.status(200).send({
              Success: "Change Password Success",
            });
          } else {
            res.status(400).send({
              error: "New password is not same same password confirm",
            });
          }
        } else {
          res.status(400).send({
            error: " Wrong Old Password ",
          });
        }
      }
    } catch (error) {
      res.status(500).send({
        error: error,
      });
    }
  }
  //Post me/favorite-blog
  async FavortiteBlog(req, res, next) {
    try {
      const IDBlog = req.body.IDBlog;
      const token = req.get("Authorization").replace("Bearer ", "");
      const _id = await verifyToken(token);
      const result = await User.findOne({ _id, Status: "ACTIVE" });

      if (result != null) {
        var fv = {
          IDUser: result._doc._id,
          IDBlog,
        };
        var favoriteBlog = await FavoriteBlog.create(fv);
        res.status(200).send({
          data: favoriteBlog,
          error: "",
        });
      } else {
        res.status(404).send({
          error: "User not found",
        });
      }
    } catch (error) {
      res.status(500).send({
        data: "",
        error: error,
      });
    }
  }

  //Post me/favorite-recipe
  async FavortiteRecipe(req, res, next) {
    try {
      const IDRecipe = req.body.IDRecipe;
      const token = req.get("Authorization").replace("Bearer ", "");
      const _id = await verifyToken(token);
      const result = await User.findOne({ _id, Status: "ACTIVE" });

      if (result != null) {
        var fv = {
          IDUser: result._doc._id,
          IDRecipe,
        };
        var favoriteRecipe = await FavoriteRecipe.create(fv);
        res.status(200).send({
          data: favoriteRecipe,
          error: "",
        });
      } else {
        res.status(404).send({
          error: "User not found",
        });
      }
    } catch (error) {
      res.status(500).send({
        data: "",
        error: error,
      });
    }
  }
  // Get /me/show-blog
  async ShowBlog(req, res, next) {
    try {
      var listBlog = await Blog.find({ Status: "CONFIRM" });
      res.status(200).send({
        data: listBlog,
        error: "",
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        data: "",
        error: error,
      });
    }
  }
  // Get /me/show-recipe
  async ShowRecipe(req, res, next) {
    try {
      var listRecipe = await Recipe.find({ Status: "CONFIRM" });
      res.status(200).send({
        data: listRecipe,
        error: "",
      });
    } catch (error) {
      res.status(500).send({
        data: "",
        error: error,
      });
    }
  }
  // Post create-comment
  async CreateComment(req, res, next) {
    try {
      const comment = req.body.Comment;
      const stars = req.body.Stars;
      const idRecipe = req.body.IDRecipe;
      const token = req.get("Authorization").replace("Bearer ", "");
      const _id = await verifyToken(token);
      const userDb = await User.findOne({ _id, Status: "ACTIVE" });
      if (userDb != null) {
        const commentRecipe = await Comment.create({
          Comment: comment,
          Stars: stars,
          IDUser: userDb._doc._id,
          IDRecipe: idRecipe,
        });
        res.status(200).send({
          data: commentRecipe,
          error: "",
        });
      } else {
        res.status(400).send({
          data: "",
          error: "Not Found User",
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).send({
        data: error,
        error: "Internal Server Error",
      });
    }
  }
   // Put edit-comment
   async EditComment(req, res, next) {
    try {
      const comment = req.body.Comment;
      const stars = req.body.Stars;
      const idComment = req.body.IDComment;
      const token = req.get("Authorization").replace("Bearer ", "");
      const _Comment = await Comment.findOne({_id: idComment});
      const _id = await verifyToken(token);
      if (_id == _Comment._doc.IDUser) {
        var update = {
          Comment: comment,
          Stars: stars,
        }
        var commentRecipe =await Comment.findOneAndUpdate(
          { _id:  idComment},
          update,
          {
            new: true,
          }
        );
        res.status(200).send({
          data: commentRecipe,
          error: "",
        });
      } else {
        res.status(400).send({
          data: "",
          error: "Not Found User",
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).send({
        data: error,
        error: "Internal Server Error",
      });
    }
  }

     // Delete delete-comment
     async DeleteComment(req, res, next) {
      try {
        var update = {
          Status: "Deleted",
        };
        var _IDComment = req.query.id;
        const token = req.get("Authorization").replace("Bearer ", "");
        const _id = await verifyToken(token);
        const userDb = await User.findOne({ _id, Status: "ACTIVE" });
        var comment = await Comment.findOne({ _id: _IDComment });
        if (comment._doc.IDUser == userDb._doc._id) {
          const commentUpdate = await Comment.findOneAndUpdate(
            { _id: _IDComment },
            update,
            {
              new: true,
            }
          );
          res.status(200).send({
            data: commentUpdate,
            error: "",
          });
        } else {
          res.status(400).send({
            data: "",
            error: "No Autheraziton",
          });
        }
      } catch (error) {
        console.log(error);
        res.status(500).send({
          data: error,
          error: "Internal Server Error",
        });
      }
    }
}
module.exports = new MeController();
