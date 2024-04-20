# ApplyTrackify

## Overview

ApplyTrackify is a web app that will allow users to keep track of multiple application lists. Users can register and login. Once they're logged in, they can see the closest deadlines and create or view their application list. For every list that they have, they can edit or delete the tracker table.

ApplyTrackify is designed to simplify the lives of users by providing them with a structured and intuitive interface to monitor the progress of their applications, deadlines, submission statuses, and any specific requirements or notes associated with each application. ApplyTrackify ensures that users can efficiently organize their application efforts, avoid missing critical deadlines, and maintain an overview of all necessary application components at a glance.

## Data Model

The application will store Users, Graduate Program Tracker Lists, and Graduate Program Trackers.

* users can have multiple graduate tracker lists (via references)
* each graduate tracker list can have multiple graduate trackers (via references)

An Example User:

```javascript
{
  username: "userExample",
  hash: // a password hash,
  email: "user@example.com", // user email
  graduateProgramTrackerLists: // an array of references to Graduate Program Tracker List documents
}
```
An Example Graduate Program Tracker List:

```javascript
{
  user: // a reference to a User object
  name: "25Fall CS Master",
  graduateTrackers: // an array of references to Graduate Tracker documents
  slug: // using mongoose-slug-updater, slug:name 
}
```

An Example Graduate Program Tracker:

```javascript
{
  user: // a reference to a User object
  graduatetrackerList: // a reference to a Graduate Program Tracker List object
  university: "New York University",
  program: "MSCS",
  deadline: "2024-03-01", 
  submissionStatus: "Submitted", 
  applicationStatus: "Accepted",
  url: "https://apply.gsas.nyu.edu/apply/",
  requirements: "3 letters of recommendation, TOEFL 100, GRE optional", 
  memo: "Need to follow up on recommendation letters", 
}
```

## [Link to Commented First Draft Schema](db.mjs) 

## Wireframes

/login - page for login
![login](documentation/login.jpg)

/register - page for register
![register](documentation/register.jpg)

/dashboard/verify-email - page for email verification
![verify-email](documentation/verify-email.jpg)

/dashboard - the main page that the user can see after logging in, where the user can create new tracker lists and view existing lists
![dashboard](documentation/dashboard.jpg)

<!-- /dashboard/create - page for creating a new tracker list
[04/10: delete this page]
![create-list](documentation/create-list.jpg) -->

/dashboard/slug-for-list - page for showing specific tracker list
![dashboard-slug-list](documentation/dashboard-slug-list.jpg)

/dashboard/slug-for-list/slug-for-tracker/edit - page for editing specific tracker of specific tracker list
![edit-tracker](documentation/edit-tracker.jpg)

/dashboard/slug-for-list/create-tracker - page for creating a new tracker of specific tracker list
![create-tracker](documentation/create-tracker.jpg)

## Site map
[04/10: remove the path from register page to email verification page (may add the email verification functionality to dashboard later), also remove the create-list page]
![site-map](documentation/site-map.jpg)

## User Stories or Use Cases

1. as non-registered user, I can register a new account
2. as a user, I can log in to the site
3. as a user, I can create a new tracker list 
4. as a user, I can view or rename or delete all of the tracker lists I've created
5. as a user, I can add graduate trackers to an existing graduate tracker list
6. as a user, I can see the recent deadline in the user's main page
7. as a user, I can edit or delete each trackers I created
8. as a user, I can verify my email and receive an email remainder right before the deadline

## Research Topics

* (2 points) Bootstrap
    * Bootstrap is a popular front-end framework for developing responsive and mobile-first websites.
    * Bootstrap is chosen for its extensive component library and responsive design features, which significantly speed up the development process.
    * Possible candidate modules or solutions: The core Bootstrap framework for CSS and JavaScript components.
* (6 points) Nodemailer for Email Verification and Reminders
    * Nodemailer is a module for Node.js applications to send emails easily. It supports various transport methods, including SMTP, and can be integrated into server-side logic to automate the process of sending emails from within an application.
    * Nodemailer is chosen for its flexibility and ease of use in sending automated emails, such as reminders or notifications, directly from the server. 
    * I think it's a challenging library to learn, so I've assigned it 5 points.
    * Possible candidate modules or solutions: nodemailer as the primary module for email sending functionality.
* (2 points) Moment.js
    * Moment.js is a widely used library in JavaScript that provides a multitude of options for parsing, validating, manipulating, and formatting dates.
    * The choice of Moment.js is based on its robust feature set that simplifies date-related operations, which can often be complex due to the inconsistencies across different locales and time zones.

10 points total out of 10 required points 


## [Link to Initial Main Project File](app.mjs) 

## Annotations / References Used

1. [moment.js](https://momentjs.com/)
2. [Nodemailer](https://www.nodemailer.com/about/)
3. [Bootstrap](https://getbootstrap.com/)
4. [Bootstrap theme build](https://bootstrap.build/themes)
