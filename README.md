[![Build Status](https://semaphoreci.com/api/v1/projects/4181fa93-c552-4fe9-bb94-ea7ab2fe1894/605934/shields_badge.svg)](https://semaphoreci.com/artursmirnov/apiarius)

# apiarius
Automatic API documentation generator

####Conventions:
* directory = API documentation instance
* repository = source code storage

####Links:
* Project: [overv.io](https://overv.io/workspace/artursmirnov/zany-herd/board/)
* Github API reference: https://developer.github.com/v3/
* YUIDoc: https://github.com/yui/yuidoc
* Sane Stack: http://sanestack.com/
* Semaphore CI: https://semaphoreci.com/artursmirnov/apiarius
* Moment.js: https://github.com/stefanpenner/ember-moment#usage
* ember-bootstrap: http://kaliber5.github.io/ember-bootstrap/
* Font Awesome: https://github.com/martndemus/ember-cli-font-awesome#basic-usage
* Ember i18n: https://github.com/jamesarosen/ember-i18n#ember-i18n---internationalization-for-ember


####Workflow:
* Create new issue in backlog
* Plan it for any milestone and prioritize as needed
* Create new branch for the issue and put the branch name to the issue as a comment
* Move the issue to `In progress`
* Implement according the priorities
* Pass to `Testing`, to the bottom of the list
* Test the issue and verify if everything works as expected
* If testing failed, move the issue back to `In progress`
* If testing succeeded then merge the branch to `staging` and move the issue to `Ready to deploy`
* Deploy all the stories in `Ready to deploy` to dev server and close all appropriate issues
* Once all the milestone issues are closed:
  * Merge `staging` branch to `master` 
  * Deploy to production server
  * Close the milestone
