K23-CCL1127 Build the K23 Photobooth App Part 1 - The Custom Component
===============================================
Abstract: In part 1 of this two-part lab series, use the ServiceNow Command Line tool (CLI) to create the custom component that controls the Photobooth on the CreatorCon floor. You will learn how to use the CLI to scaffold a new custom component and use HTML5 and JavaScript with the computer's camera to take a series of photos. There is a second part of this series that involves configuring the component in UI Builder (UIB), but that isn't a pre-requisite as this lab will focus on building and deploying the component.

# Branches
The branches are setup with **main** containing the completed lab and branches for each exercise that represents the state of that exercise *at completion*.  This can be used to catch you up.  E.g., if you are unable to complete exercise 1 you may use a GIT command like the following to retrieve the completed exercise to begin dev on Exercise 2.  
```
git checkout exercise_1 -f
```

## Branches
| Branch | Description |
|--------|-------------|
| main | Completed app |
| exercise_0 | Installing CLI and Scaffolding (start here) |
| exercise_1 | Authentication and Camera Initialization |
| exercise_2 | Properties and Test Page |
| exercise_3 | Triggering and Handling Events |
| exercise_4 | Deploying to an instance |

Use the following command to switch branches.  Start with exercise_0.
```
git checkout exercise_0 -f
```
