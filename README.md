# node-hackernews

A Hacker News scraper/bot for Node.js. Drink responsibly.

## Module

`npm install hackernews`

Methods:

* **hackernews.popular([pageNumber = 1,] callback(err, json))** &mdash; Most popular stories.

* **hackernews.newest([pageNumber = 1,] callback(err, json))** &mdash; Newset submissions.

* **hackernews.story(id, [pageNumber = 1,] callback(err, json))** &mdash; Story and its comments.

* **hackernews.submitted(username, [pageNumber = 1,] callback(err, json))** &mdash; Stories submitted by a user.

* **hackernews.commented(username, [pageNumber = 1,] callback(err, json))** &mdash; Comments by a user.

* **hackernews.profile(username, callback(err, json))** &mdash; Profile of a user.

Authenticated calls require `login()`, which returns a new, authenticated API object to its callback.

* **hackernews.login(username, password, callback(err, userAPI))** &mdash; Login as a user. Passes a new authenticated API object to the callback, with the above methods as well as:

* **hackernews.upvote(id, callback(err, json))** &mdash; Upvote an item.

* **hackernews.downvote(id, callback(err, json))** &mdash; Downvote an item.

* **hackernews.comment(id, text, callback(err, json))** &mdash; Comment on a post.

## CLI `hackernews` or `hn`

```
$ npm install -g hackernews
$ hackernews
$ hn # same thing
$ hn 4 # page 4
```