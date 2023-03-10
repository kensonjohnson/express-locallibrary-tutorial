import { body, validationResult } from "express-validator";
import Author from "../models/author.js";
import Book from "../models/book.js";

// Display list of all Authors.
export async function authors(req, res, next) {
  const allAuthors = Author.find({}).sort({ family_name: 1 });

  try {
    const data = await allAuthors;

    if (data === null) {
      const error = new Error("Author not found");
      error.status = 404;
      return next(error);
    }

    res.render("authors", {
      title: "All Authors",
      data,
      page: "authors",
    });
  } catch (error) {
    res.render("error", { error });
  }
}

// Display detail page for a specific Author.
export async function authorDetails(req, res, next) {
  const author = Author.findById(req.params.id);
  const booksByAuthor = Book.find({ author: req.params.id }, "title summary");
  try {
    const data = { author: await author, booksByAuthor: await booksByAuthor };

    if (data === null) {
      const error = new Error("Author not found");
      error.status = 404;
      return next(error);
    }

    res.render("authorDetails", {
      title: "Author Details",
      data,
      page: "authors",
    });
  } catch (error) {
    res.render("error", { error });
  }
}
// Display Author create form on GET.
export function newAuthor(req, res) {
  res.render("newAuthor", { title: "Create Author" });
}

// Handle Author create on POST.
const validateAuthorFirstName = body("first_name")
  .trim()
  .isLength({ min: 1 })
  .escape()
  .withMessage("First name must be specified.");
const validateAuthorFamilyName = body("family_name")
  .trim()
  .isLength({ min: 1 })
  .escape()
  .withMessage("Last name must be specified.");
const validateAuthorDateOfBirth = body(
  "date_of_birth",
  "Invalid date of birth."
)
  .optional({ checkFalsy: true })
  .isISO8601()
  .toDate();
const validateAuthorDateOfDeath = body(
  "date_of_death",
  "Invalid date of death."
)
  .optional({ checkFalsy: true })
  .isISO8601()
  .toDate();
const processNewAuthor = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.render("newAuthor", {
      title: "Create Author",
      author: req.body,
      errors: errors.array(),
    });
    return;
  } else {
    const author = new Author({
      first_name: req.body.first_name,
      family_name: req.body.family_name,
      date_of_birth: req.body.date_of_birth,
      date_of_death: req.body.date_of_death,
    });
    author.save((error) => {
      if (error) {
        return next(error);
      }
      res.redirect(author.url);
    });
  }
};
export const createNewAuthor = [
  validateAuthorFirstName,
  validateAuthorFamilyName,
  validateAuthorDateOfBirth,
  validateAuthorDateOfDeath,
  processNewAuthor,
];

// Display Author delete form on GET.
export async function deleteAuthorForm(req, res) {
  try {
    const author = Author.findById(req.params.id);
    const booksByAuthor = Book.find({ author: req.params.id });
    const data = { author: await author, booksByAuthor: await booksByAuthor };
    if (author === null) {
      res.redirect("catalog/authors");
    }
    res.render("deleteAuthor", {
      title: "Delete Author",
      data,
    });
  } catch (error) {
    res.render("error", error);
  }
}

// Handle Author delete on POST.
export async function deleteAuthorSubmit(req, res, next) {
  try {
    const author = Author.findById(req.body.authorid);
    const booksByAuthor = Book.find({ author: req.body.authorid });
    const data = { author: await author, booksByAuthor: await booksByAuthor };

    if (data.booksByAuthor.length > 0) {
      res.render("deleteAuthor", {
        title: "Delete Author",
        data,
      });
      return;
    } else {
      Author.findByIdAndDelete(req.body.authorid, (error) => {
        if (error) {
          return next(error);
        }
        res.redirect("/catalog/authors");
      });
    }
  } catch (error) {
    res.render("error", error);
  }
}

// Display Author update form on GET.
export async function updateAuthorForm(req, res) {
  try {
    const author = await Author.findById(req.params.id);
    if (author === null) {
      res.redirect("/catalog/authors", { title: "All Authors" });
    }
    res.render("newAuthor", { title: "Update Author", author });
  } catch (error) {
    res.render("error", error);
  }
}

// Handle Author update on POST.
const processUpdateAuthor = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.render("newAuthor", {
      title: "Create Author",
      author: req.body,
      errors: errors.array(),
    });
    return;
  } else {
    const author = new Author({
      first_name: req.body.first_name,
      family_name: req.body.family_name,
      date_of_birth: req.body.date_of_birth,
      date_of_death: req.body.date_of_death,
      _id: req.params.id,
    });
    Author.findByIdAndUpdate(
      req.params.id,
      author,
      {},
      (error, updatedAuthor) => {
        if (error) {
          return next(error);
        }
        res.redirect(updatedAuthor.url);
      }
    );
  }
};

export const updateAuthorSubmit = [
  validateAuthorFirstName,
  validateAuthorFamilyName,
  validateAuthorDateOfBirth,
  validateAuthorDateOfDeath,
  processUpdateAuthor,
];
