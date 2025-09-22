Assignment 3 - Persistence: Two-tier Web Application with Database, Express server, and CSS template
===
## Your Web Application Title

Your Render (or alternative server) link e.g. http://a3-joshua-cuneo.render.me

Include a very brief summary of your project here. Images are encouraged, along with concise, high-level text. Be sure to include:

- the goal of the application
- challenges you faced in realizing the application
- what authentication strategy you chose to use and why (choosing one because it seemed the easiest to implement is perfectly acceptable)
- what CSS framework you used and why
  - include any modifications to the CSS framework you made via custom CSS you authored
- a list of Express middleware packages you used and a short (one sentence) summary of what each one does. If you use a custom function, please add a little more detail about what it does.




## Baseline Requirement - Server (completed ✅)(15 pts):
- Created the server using Express as required for this assignment. The server can be found in server.js

## Baseline Requirement - Results (completed ✅)(15 pts):
- All data entered by user is shown under the form in a table. This is where they will see all the to-do items they have submitted through the form. This is specific for that user only and in the top right corner they will see their username and a logout option as well (GitHub authentication).

## Baseline Requirement - Form/Entry (completed ✅)(15 pts):
- There is a form functionality where users are allowed to add new to-do items and once added, they can modify or delete them as well. These entries are specific to their account and it is connected with their GitHub account.

## Baseline Requirement - Form/Entry (completed ✅)(15 pts):
- The data storage is persistent across server sessions using MongoDB. All to-do items will persist even after logging out/closing window and when re-logging back in, that data will be there for each user.

## Baseline Requirement - CSS Framework/Template (completed ✅)(10 pts):
- I utilized Bootstrap as my CSS Framework for both the login page and the main page of my website. However, I did tweek some of the default styles from Bootstrap to better fit my vision of the design for the website (Bootstrap is default framework but as professor said we can make some changes if we want).


## Baseline Requirement - HTML (completed ✅)(5 pts):
- I used a variety of HTML tags such as text, date, button etc. and also used /api/me that fetches the currently authenticated user and the user’s GitHub username and avatar are displayed in the profile dropdown. The To Do table dynamically displays only that user’s tasks, so each user sees their own data, not data from other users. 

## Baseline Requirement - General (completed ✅)(10 pts):  
- My webpage achieved at least 90% on the `Performance`, `Best Practices`, `Accessibility`, and `SEO` tests using Google [Lighthouse](https://developers.google.com/web/tools/lighthouse) (don't worry about the PWA test, and don't worry about scores for mobile devices). Proof will be below.


## Technical Achievement - OAuth Implementation (completed ✅)(10 pts):
- I implemented OAuth for this assignment using the passport.js library via the GitHub strategy. My website uses GitHub authentication and each user sees only data pertaining to their account (data they submitted through the to-do form).

## Technical Achievement - 100 % Google Lighthouse Tests (completed ✅)(5 pts):
- My webpage got 100% (not 98%, not 99%, but 100%) in all four lighthouse tests required for this assignment.
- 
  
