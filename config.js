'use strict';

module.exports = {
  url: 'https://lumen.netlify.com',
  pathPrefix: '/',
  title: 'Blog by Jon Mellman',
  subtitle: 'Posts by Seattle-based software developer, musician, and occasional blogger.',
  copyright: '© All rights reserved.',
  disqusShortname: 'jonmellman',
  postsPerPage: 5,
  googleAnalyticsId: 'UA-149687332-1',
  useKatex: false,
  menu: [
    {
      label: 'Articles',
      path: '/'
    },
    {
      label: 'About me',
      path: '/pages/about'
    },
    {
      label: 'Contact me',
      path: '/pages/contacts'
    }
  ],
  author: {
    name: 'Jon Mellman',
    photo: '/photo.jpg',
    bio: 'Seattle-based software developer, musician, and occasional blogger.',
    contacts: {
      email: 'jonmellman@gmail.com',
      telegram: '',
      twitter: '',
      github: 'jonmellman/',
      rss: '',
      vkontakte: '',
      linkedin: 'https://www.linkedin.com/in/jon-mellman/',
      youtube: 'https://www.youtube.com/channel/UCoKNvLs9j6VBtKww7OsZ_rA/featured'
    }
  }
};
