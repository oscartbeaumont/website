---
title: Netflix Desktop
---

I recently wrote an application called Netflix Desktop you can find the code [here on Github](https://github.com/oscartbeaumont/Netflix-Desktop). It is an [Electron](https://electronjs.org/) wrapper for [Netflix](https://netflix.com/). I thought I would talk about why I built it and some of the problems I had while building it.

# The Problem It Solves
I am a [Tab-Hoarder](https://www.urbandictionary.com/define.php?term=Tab-Hoarder). The process of launching a web browser requires all of those websites to open again and it is something that I didn't want to have to deal with when I want to relax and watch Netflix. I wrote this application so that I could have a Netflix app, removing the need for me to launch my main web browser. I published it for Linux and Mac because those are the operating systems I use. The application would run on Windows but the complication process (On TravisCI) was proving too much effort for something that was unnecessary, especially since Windows already has a Netflix app in the Windows Store.

# Developing It
I started off by creating a basic Electron application and I got it to load the webpage of Netflix. It was working perfectly until I starting playing a show. It turns out Netflix use [Widevine](https://www.widevine.com/) for their DRM protection and Electron doesn't have that by default. After finding ```electron-widevinecdm``` an Electron package that supports Widevine and adding it to the application, I had Netflix running. I then spent an inordinate amount of time learning to compile the Electron app into a distributable that would support many platforms. I eventually ended up using ```electron-builder``` and I also set up a [TravisCI](https://travis-ci.org) build pipeline so the build process was automated and less of a problem for me in the future. It was so difficult because of the use of cross compilation (compiling for a different operating system then you are running).

# Conclusion
You can download the application from [here](https://github.com/oscartbeaumont/Netflix-Desktop/releases). It was the perfect solution to the simple problem and taught me about how running an application for development may be easy but publishing them can prove a difficult challenge.
