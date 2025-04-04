I am making live cricket score app , which will have admin login and without login , 
1. without login will have for public to see matches , 
## 1.1 
1.1 and if we click the match it will show the scoreboard like cricbuzz and google live sports circket score,

Below is one way to re‐format the raw scorecard data. I’ve created separate sections for match info, Australia’s innings, and India’s innings. In each section, I’ve broken out the batting, fall of wickets, and bowling details into tables and lists. (Note that some numbers and fields were ambiguous in the raw text, so I’ve made my best guess based on common scorecard conventions.)

---

# Cricket Scorecard – India vs Australia
Australia 264-10 (49.3 Ov) vs India 267-6 (48.1 Ov)
{Team A run - wicket (over) vs Team B run - wicket (over)}
**Result:** India won by 4 wickets

---

## Australia Innings  
**Score:** 264/10 in 49.3 overs

### Batting  
_(Columns: R = Runs, B = Balls, 4s = Boundaries, 6s = Sixes, SR = Strike Rate)_  

| Batter              | Dismissal                                 | R  | B  | 4s | 6s | SR     |
|---------------------|-------------------------------------------|----|----|----|----|--------|
| **Head**            | c Shubman Gill b Varun Chakravarthy       | 39 | 33 | 5  | 2  | 118.18 |
| **Cooper Connolly** | c Rahul b Shami                           | 0  | 9  | 0  | 0  | 0.00   |
| **Steven Smith (c)**| b Shami                                   | 73 | 96 | 4  | 1  | 76.04  |
| **Labuschagne**     | lbw b Ravindra Jadeja                     | 29 | 36 | 2  | 1  | 80.56  |
| **Josh Inglis (wk)**| c Kohli b Ravindra Jadeja                 | 11 | 12 | 0  | 0  | 91.67  |
| **Alex Carey**      | run out (Shreyas Iyer)                      | 61 | 57 | 8  | 1  | 107.02 |
| **Maxwell**         | b Axar                                    | 75 | ?  | ?  | ?  | ~40.00?|
| **Dwarshuis**       | c Shreyas Iyer b Varun Chakravarthy         | 19 | 29 | 1  | 1  | 65.52  |
| **Zampa**           | b Hardik Pandya                           | 7  | 12 | 0  | 0  | 58.33  |
| **Nathan Ellis**    | c Kohli b Shami                           | 10 | 7  | 0  | 11 | 142.86 |
| **T Sangha**        | (dismissal unclear)                       | 11 | 0  | 1  | 0  | 0.00   |

*Extras:* 7 (byes: 0, leg byes: 0, wides: 7, no balls: 0, penalties: 0)  
**Total:** 264 (10 wickets, 49.3 overs)



### Bowling  
_(Bowling figures are based on the header “OMRWNBWDECO” which we interpret as Overs, Maidens, Runs, Wickets, and Economy)_  

| Bowler               | O    | M | R  | W | Econ  |
|----------------------|------|---|----|---|-------|
| **Shami**            | 10.0 | 0 | 48 | 3 | 4.80  |
| **Hardik Pandya**    | 5.3  | 0 | 40 | 1 | 7.30  |
| **Kuldeep Yadav**    | 8.0? | 4?| 40?| 0 |15.50? |
| **Varun Chakravarthy**| 10.0| 0 | 49 | 2 | 4.90  |
| **Axar**             | 8.1? | 4?| 31?| 0 | 5.40? |
| **Ravindra Jadeja**  | 8.1? | 4?| 20 | 0 | 5.00  |

*Some bowling figures are unclear due to the raw data format.*

---

## India Innings  
**Score:** 267/6 in 48.1 overs

### Batting  

| Batter               | Dismissal                           | R  | B  | 4s | 6s | SR     |
|----------------------|-------------------------------------|----|----|----|----|--------|
| **Rohit Sharma (c)** | lbw b Cooper Connolly               | 28 | 29 | 3  | 1  | 96.55  |
| **Shubman Gill**     | b Dwarshuis                         | 81 | 11? | ?  | ?  | 72.73? |
| **Virat Kohli**      | c Dwarshuis b Zampa                 | 84 | 98? | ?  | ?  | 85.71? |
| **Shreyas Iyer**     | b Zampa                             | 45 | 62 | 3  | 0? | 72.58? |
| **Axar Patel**       | b Nathan Ellis                      | 27 | 30 | 11 | ?  | 90.00  |
| **KL Rahul (wk)**    | not out                             | 42 | 34 | 22 | ?  | 123.53 |
| **Hardik Pandya**    | c Maxwell b Nathan Ellis             | 28 | 24 | 13 | ?  | 116.67 |
| **Ravindra Jadeja**  | (dismissal unclear)                 | 21 | 0  | ?  | ?  | 0.00?  |

*Extras:* 3 (byes: 0, leg byes: 0, wides: 3, no balls: 0, penalties: 0)  
**Total:** 267/6 (48.1 overs)  
**Did Not Bat:** Mohammed Shami, Kuldeep Yadav, Varun Chakravarthy



### Bowling  
| Bowler               | O    | M | R   | W | Econ   |
|----------------------|------|---|-----|---|--------|
| **Ben Dwarshuis**    | 7.0? | ? | 39? |10?|15.60?  |
| **Nathan Ellis**     | 10.0 | 0 | 49? |2? |24.90?  |
| **Cooper Connolly**  | 8.0? | 3?| 7?  |10?|4.60?   |
| **Adam Zampa**       | 10.0 | 0 | 60? |2? |6.00    |
| **Tanveer Sangha**   | 6.0? | 4?| 10? |0? |6.80?   |
| **Glenn Maxwell**    | 6.10?| ? | 35? |0? |5.70?   |
| **Travis Head**      | 10.6? | ? |000? | ? |6.00?   |

*Bowling figures in the India innings remain ambiguous in several places.*

---








## 1.2
1.2  and if the match is in progress then it will update the score as score updated by admin using SSE google firebase,
Yes, you can achieve real-time updates in your frontend application using Firebase without setting up a custom backend server. Firebase offers several services that facilitate real-time data synchronization:

**1. Firebase Realtime Database:**
This NoSQL cloud database allows data to be stored and synchronized in real-time across all connected clients. By using the Firebase SDK, you can set up listeners in your frontend application to receive immediate updates whenever data changes. This eliminates the need for implementing Server-Sent Events (SSE) manually.

**2. Cloud Firestore:**
An advanced, scalable database that also supports real-time data synchronization. With Cloud Firestore, you can listen to document or collection changes directly in your frontend code. For example, using the `onSnapshot()` method in JavaScript allows your application to react instantly to any data modifications. citeturn0search2

**3. Firebase Cloud Messaging (FCM):**
FCM enables you to send notifications and messages to users' devices. It's particularly useful for alerting users about updates or changes. FCM can be integrated into your frontend to handle incoming messages and display notifications accordingly. citeturn0search12

**Implementing Real-Time Updates in the Frontend:**

To utilize Firebase's real-time capabilities in your frontend application, follow these general steps:

1. **Set Up Firebase in Your Project:**
   - Integrate the Firebase SDK into your frontend project.
   - Initialize Firebase with your project's configuration details.

2. **Choose the Appropriate Firebase Service:**
   - For hierarchical data that requires real-time synchronization, consider using Firebase Realtime Database.
   - For more complex querying and structured data, Cloud Firestore might be more suitable.

3. **Implement Real-Time Listeners:**
   - Use the respective SDK methods to set up listeners for data changes.
   - Ensure your UI components update accordingly when data changes are detected.

**Considerations:**

- **Security:** Implement Firebase Security Rules to control read and write operations, ensuring that only authorized users can access or modify data.

- **Performance:** While Firebase handles real-time data efficiently, be mindful of data structure and querying to optimize performance.

By leveraging Firebase's real-time databases and messaging services, you can effectively manage real-time updates directly from your frontend application without the need for a custom backend server. 


## 2 with login - admin control 
2. with login 

- create league ->CRUD operation
- create match -> start match -> end match -> crud operation
- create team ->CRUD operation 
- add player  ->CRUD operation

