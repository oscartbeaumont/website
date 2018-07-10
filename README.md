# My Personal Website
This Repository Holds The Code For My Personal Website [otbeaumont.me](https://otbeaumont.me). The Site Is Built Using The [Hexo Static Site Generator](https://hexo.io) And Uses A Modified Version Of The [Hexo Apollo Theme](https://github.com/pinggod/hexo-theme-apollo). The Hexo Source In On The Main Branch And Github Pages Hosts The "docs/" Folder Which Contains The Generated Static HTML For The Site.

# Maintaing This Site
To Make Changes To This Site Just Use The Commands Below:
```
git clone https://github.com/oscartbeaumont/website.git
cd website
npm install
hexo serve
```
Then Navagate To [localhost:4000](http://localhost:4000) In Your Browser To View The Site Locally. You Can Access The [Hexo Admin Interface](https://jaredforsyth.com/hexo-admin/) By Going To [localhost:4000/admin/](http://localhost:4000/admin/) (Please Be Aware This Interface Only Exists When Running Locally). Now You Can Begin Modifing The Configs/Files To Update The Websites Content.

# Publishing New Version
To Publish A New Version Of This Website Use The Command's Below (In Your Hexo Project Folder):
```
hexo generate
```
Then Commit Your Changes To Git To Publish It.
