# node-hackernews

For the CLI program `hackernews`:

```
npm install -g hackernews
hackernews [4] # fourth page
```

For the module:

`npm install hackernews`

**hackernews.popular([pageNumber = 1,] callback(err, json))** &mdash; Most popular stories.

**hackernews.newest([pageNumber = 1,] callback(err, json))** &mdash; Newset submissions.

**hackernews.story(id, [pageNumber = 1,] callback(err, json))** &mdash; Story and its comments.

**hackernews.submitted(username, [pageNumber = 1,] callback(err, json))** &mdash; Stories submitted by a user.

**hackernews.commented(username, [pageNumber = 1,] callback(err, json))** &mdash; Comments by a user.

**hackernews.profile(username, callback(err, json))** &mdash; Profile of a user.

**hackernews.login(username, password, callback(err, json))** &mdash; Login as a user.