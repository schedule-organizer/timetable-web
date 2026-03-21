## Idea is to create smart schedule which will count different criteria for scheduling. 

Examples:

**Example 1 -> Learning sessions in rooms **

There are multiple rooms , multiple instructors and multiple students. those rooms has their own availability and instructors and students has their own availability we need to create a system to count different criteria to book rooms for the reason which suits to everyone. 

**Example 2 -> Service Center booking with different Masters**

In the same city there are multiple places where the same master may provide different services and has their own availabilities and need some interval to reach from one place to another and based on requirements we need to schedule optimal plan for the master to solve all requests and be in time and not spend much time in the road. Also the same room can be used by other masters so we need to count it as well.

**Example 3 -> School/University Schedule**

Multiple instructors , multiple rooms and multiple students and the plan which must be followed. 
we need to solve it in optimal way to provide best way for each actor. 
Students should have similar difficult subjects and amount of lessons in the same day
Teachers should have minimal intervals during the day and the week
Subjects must be split equal difficulties for the same day
Rooms must be used optimal (optional)

**Example 4 -> Meeting Rooms Optimizer**

In our company there are multiple rooms where each employee may book and use, we have rooms with the different capacity, sometimes the bigger rooms are booked by 2-3 people and other team should postpone their meeting to find available slot or maybe use small room. 

The goal is:
- Monitor during the week and provide feedback to the meeting organizers to change the room or time to use rooms in optimal way.
- Monitor and in case if possible to switch rooms suggest organizers to switch rooms

Usually big rooms are required for planning, refinement, retrospective meetings. unfortunately these meetings are planned in the same day  but I believe that it is possible to organize and suggest schedule for big rooms according to the *Example 1* 

## Technology Stack

**Build Tool**
Version control - Git
Package manager - Maven
Java version - 21

**Technology Stack:**
Language - Java, JavaFX 
Database - PostgresSql
ORM - Hibernate

**Required Tools and Libraries**
Optaplanner - with this tool we may process optimizations

**Optional Tools**
ollama.llama3  -  easy configuring based on prompts. 
