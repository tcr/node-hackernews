#!/usr/bin/env node

var scrapi = require('scrapi');

// Define a specification for scraping Hacker News

var manifest = {
  base: 'http://news.ycombinator.com',
  spec: {
    '*': {
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
    }
  }
};

function paginate (i, next) {
  if (!next) {
    next = i;
    i = 0;
  }
  return function nextPage (err, json) {
    if (json.next && i && i--) {
      hnews(json.next).get(nextPage);
    } else {
      next(err, json);
    }
  }
}

// List stories from a given page.
var hnews = scrapi(manifest);

module.exports = {
  home: function (i, next) {
    hnews('/').get(paginate(i, next));
  },
  newest: function (next) {
    hnews('newest').get(paginate(i, next));
  },
  submitted: function (user, next) {
    hnews('submitted', {id: user}).get(paginate(i, next));
  },
  comments: function (user, next) {
    hnews('threads', {id: user}).get(paginate(i, next));
  },
  profile: function (user, next) {
    hnews('user', {id: user}).get(next);
  },
  story: function (id, next) {
    hnews('item', {id: id}).get(next);
  }
};

if (require.main === module) {
  var page = Number(process.argv[2]);
  module.exports.home(page || 1, function (err, json) {
    json.stories.forEach(function (story, i) {
      console.log('[' + ('   ' + (i + 1)).substr(-2) + ']', story.title);
      console.log('    ', story.link)
    });
  });
}