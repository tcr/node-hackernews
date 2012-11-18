#!/usr/bin/env node

var scrapi = require('scrapi');

// Define a specification for scraping Hacker News

var manifest = {
  base: 'http://news.ycombinator.com',
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
      comments: {
        $query: 'tr tr tr',
        $each: {
          user: '(text) .comhead a',
          age: '(text \\b\\d+ \\S+ \\S+) .comhead',
          id: '(attr href \\d+$) .comhead a:nth-child(2)',
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

function paginate (i, next) {
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

function createAPI (hnews) {
  return {
    // Rankings
    popular: function (i, next) {
      if (!next) next = i, i = 0;
      hnews('/').get(paginate(i, next));
    },
    newest: function (i, next) {
      if (!next) next = i, i = 0;
      hnews('newest').get(paginate(i, next));
    },

    // Story and comments
    story: function (id, i, next) {
      if (!next) next = i, i = 0;
      hnews('item', {id: id}).get(next);
    },

    // User
    profile: function (user, next) {
      hnews('user', {id: user}).get(next);
    },
    submitted: function (user, i, next) {
      if (!next) next = i, i = 0;
      hnews('submitted', {id: user}).get(paginate(i, next));
    },
    commented: function (user, i, next) {
      if (!next) next = i, i = 0;
      hnews('threads', {id: user}).get(paginate(i, next));
    },

    // Authentication
    login: function (username, password, callback) {
      // Create a new manifest to save our session.
      var user = new scrapi(manifest);
      user('newslogin').get(function (err, json) {
        user('y').post({
          u: username,
          p: password,
          fnid: json.fnid // unique key
        }, function (err, json) {
          callback(err, user);
        })
      });
    }
  };
}

module.exports = createAPI(scrapi(manifest));

if (require.main === module) {
  var page = Number(process.argv[2]) - 1;
  module.exports.popular(page || 0, function (err, json) {
    json.stories.forEach(function (story, i) {
      console.log('[' + ('   ' + (i + 1)).substr(-2) + ']', story.title);
      console.log('    ', story.link)
    });
  });
}