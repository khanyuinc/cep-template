# What is this project?
This project is a baseline template for making Adobe CEP extensions 
based on how I like to code and how I think they should be 
organized and written.   It also provides is an initial project structure, 
a grunt grunt script that automatically deploys the code into the 
CEP extensions directory on every run and automatically creates
self signed signed zxp files for easy distribution.

Currently the code in the repo has only been tested to work 
with After Effects 2014 and 2015 on OSX.  I'm fairly certain 
this project will work out of thebox for Windows but it has 
never been tested and there's no automation around Windows
either.  If anyone wants to take that on I'd be stoked!

This is a work in progress and will become better and more 
complete over time.  Here's a quick list of things I'd like
to see happen with it:

1. Automate the creation of a pkg installer to make distribution easier 
for people working on small internal projects
1. Combile all statically loaded <code>jsx</code> files into 
a single <code>jsxbin</code> file.
1. Version bump in a sensible way for automated deployment.
1. Have a story around adding an existing certificate. 
1. Not produce a new self-signed cert on every run (not a big deal)


# How to get started
1. Grab the code
```
$ git clone https://github.com/khanyuinc/cep-template.git
$ cd cep-template
$ npm install
$ grunt
```
1. Restart After Effects (or Photoshop, etc.)
1. Make something cool (see Development Workflow below for details).
1. Make a release build
```
$ grunt release
```
1.  Make an installer and distribute it.


# Notes
1. The grunt file automatically creates a new self-signed certificate
every time you make a new build.  This is completely overkill but I
did it for the ease 

# Development Workflow
1. Edit the files in the <code>src</code> directory.
1. From the terminal run <code>grunt</code>.
1. Test the extension in your target product(s) (i.e. After Effects, etc.).
1. Repeat