# node-hackernews

For the CLI program `hackernews`:

```
npm install -g hackernews
hackernews [4] # fourth page
```

For the module:

`npm install hackernews`

**hackernews.popular([pageNumber = 1,] callback(err, json))** Most popular stories.

**hackernews.newest([pageNumber = 1,] callback(err, json))** Newset submissions.

**hackernews.story(id, [pageNumber = 1,] callback(err, json))** Story and its comments.

**hackernews.submitted(username, [pageNumber = 1,] callback(err, json))** Stories submitted by a user.

**hackernews.commented(username, [pageNumber = 1,] callback(err, json))** Comments by a user.

**hackernews.profile(username, callback(err, json))** Profile of a user.