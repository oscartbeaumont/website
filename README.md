# My Personal Website
This Repository Holds The Code For My Personal Website [otbeaumont.me](https://otbeaumont.me). The Site Is Built Using The [Hexo Static Site Generator](https://hexo.io) And Uses A Modified Version Of The [Hexo Apollo Theme](https://github.com/pinggod/hexo-theme-apollo). The Hexo Source In On The Main Branch And Github Pages Hosts The "docs/" Folder Which Contains The Generated Static HTML For The Site.

# Local Website Server
To See A Rendered Version Of The Website Locally While Developing Use The Commands Below:
```
git clone https://github.com/oscartbeaumont/website.git
cd website
yarn
hexo serve
```
Then Navagate To [localhost:4000](http://localhost:4000) In Your Browser To View The Site Locally. Now You Can Begin Modifying The Configs/Files To Update The Websites Content.

# Publishing
After Modifying The Source Files Commit And Push Them To The Git Repository And Travis CI Will Them Build Them To HTML And Put Them On The Github Pages Branch Where They Are Hosted From To My Domain Using Github Pages.
