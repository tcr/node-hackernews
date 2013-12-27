#!/usr/bin/env node

var scrapi = require('scrapi');
//var colors = require('colors');

// Define a specification for scraping Hacker News using Scrapi.

var manifest = {
  base: 'https://news.ycombinator.com',
  spec: {
    '*': {
      login: {
        $query: 'td:nth-child(3) span.pagetop a[href^=user]',
        $value: '(text)'
      },
      stories: {
        $query: 'table table tr:nth-child(3n+1)',
        $each: {
          title: '(text) td.title a:nth-child(1)',
          link: '(attr href) td.title a:nth-child(1)',
          user: '(text) + tr a[href^=user]',
          comments_count: '(text ^\\d+) + tr a[href^=item]',
          id: '(attr href \\d+$) + tr a[href^=item]',
          points: '(text ^\\d+) + tr td.subtext',
          age: '(text \\d+ \\S+ ago) + tr td.subtext'
        },
        $filter: 'id'
      },
      next: {
        $query: 'table table td:nth-child(1) + td.title',
        $value: '(attr href) a'
      }
    },
    'item': {
      story: '(html) table table:nth-child(1) tr:nth-child(4) td',
      upvote: '(attr href) center > table table:nth-child(1) td:nth-child(1) a[id^=up_]',
      downvote: '(attr href) center > table table:nth-child(1) td:nth-child(1) a[id^=down_]',
      fnid: '(attr value) form[action=/r] input[name=fnid]',
      comments: {
        $query: 'tr tr tr',
        $each: {
          user: '(text) .comhead a',
          age: '(text \\b\\d+ \\S+ \\S+) .comhead',
          id: '(attr href \\d+$) .comhead a:nth-child(2)',
          parent: '(attr href \\d+$) .comhead a:nth-child(3)',
          indent_width: '(attr width) > td:nth-child(1) img',
          text: '(html) .comment font',
          color: '(attr color) .comment font'
        }
      }
    },
    'user': {
      $query: 'table table',
      name: '(text) tr:nth-child(1) td:nth-child(2)',
      created: '(text) tr:nth-child(2) td:nth-child(2)',
      karma: '(text) tr:nth-child(3) td:nth-child(2)',
      average_karma: '(text) tr:nth-child(4) td:nth-child(2)',
      about: '(text) tr:nth-child(5) td:nth-child(2)'
    },
    'newslogin': {
      fnid: {
        $query: 'input[name=fnid]',
        $value: '(attr value)'
      }
    }
  }
};

// For pagination we'll have to recursively go through the "next"
// link at the bottom. The format for this link is the same on each
// scraped page, so we can abstract it.
function paginate (hnews, i, next) {
  if (!next) {
    next = i;
    i = 0;
  }
  return function nextPage (err, json) {
    if (json.next && i--) {
      hnews(json.next).get(nextPage);
    } else {
      next(err, json);
    }
  }
}

// Create an API object around a Scrapi instance. Allows us to
// create an anonymouse interface as the module, and allow logging
// in with a specific username as well.
function createAPI (hnews) {
  return {
    // Rankings
    popular: function (i, next) {
      if (!next) next = i || 0;
      hnews('/').get(paginate(hnews, i, next));
    },
    newest: function (i, next) {
      if (!next) next = i || 0;
      hnews('newest').get(paginate(hnews, i, next));
    },

    // Story and comments
    story: function (id, i, next) {
      if (!next) next = i || 0;
      hnews('item', {id: id}).get(next);
    },

    // User
    profile: function (user, next) {
      hnews('user', {id: user}).get(next);
    },
    submitted: function (user, i, next) {
      if (!next) next = i || 0;
      hnews('submitted', {id: user}).get(paginate(hnews, i, next));
    },
    commented: function (user, i, next) {
      if (!next) next = i || 0;
      hnews('threads', {id: user}).get(paginate(hnews, i, next));
    },

    // Authenticated calls.
    login: function (username, password, callback) {
      // Create a new manifest to save our session.
      var user = scrapi(manifest);
      user('newslogin').get(function (err, json) {
        user('y').post({
          u: username,
          p: password,
          fnid: json.fnid // unique key
        }, function (err, json) {
          callback(err, createAPI(user));
        })
      });
    },
    comment: function (id, text, callback) {
      hnews('item', {id: id}).get(function (err, json) {
        console.log(json);
        hnews('r').post({
          text: text,
          fnid: json.fnid // unique key
        }, callback);
      });
    },
    upvote: function (id, callback) {
      hnews('item', {id: id}).get(function (err, json) {
        hnews(json.upvote).get(callback);
      });
    },
    downvote: function (id, callback) {
      hnews('item', {id: id}).get(function (err, json) {
        hnews(json.downvote).get(callback);
      });
    }
  };
}

// Default is anonymous access.
var hackernews = module.exports = createAPI(scrapi(manifest));

// The command line can be invoked by "hn [page]" where
// page is optional, or a page number starting with 1.
if (require.main === module) {
  var page = (Number(process.argv[2]) - 1) || 0;
  hackernews.popular(page, function (err, json) {
    json.stories.forEach(function (story, i) {
      console.log(('[' + ('   ' + (i + 1 + page*30)).substr(-2) + ']').yellow.underline, story.title.bold);
      console.log(story.link.grey.italic)
    });
  });
}