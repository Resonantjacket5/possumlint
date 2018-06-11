node {
   // Get SHA1 token for the src folder:
   sh('cd src && git rev-parse HEAD > GIT_COMMIT')
               git_commit=readFile('src/GIT_COMMIT')
   short_commit=git_commit.take(6)
 
   // Get first 6 char. of SHA1 token and use it to retrieve the image docker builds:
   sh 'git rev-parse HEAD > GIT_COMMIT'
   def shortCommit = readFile('GIT_COMMIT').take(6)
   def image = docker.build(jenkinsciinfra/bind.build-${shortCommit})")
}