const db = require('./db');

const sharedSession = require("express-socket.io-session");
let { isLoggedIn, just2FAd } = require('./middleware');

const quizTime = 10;    //minutes

module.exports = {
    initLessonRoutes: initLessonRoutes,
    initSocketIO: initSocketIO
}

function initSocketIO(session, io) {
    //share session variables with Express
    io.use(sharedSession(session, {
        autoSave: true
    }));

    io.on('connection', function(socket) {
        //check if logged in
        if (socket.handshake.session.passport) {
            socket.email = socket.handshake.session.passport.user.email;
            socket.ext_id = socket.handshake.session.passport.user.ext_id;
            socket.on('lecture-progress', function(data) {
                db.setLectureProgress(socket.email, socket.ext_id, data.slide, data.lesson)
                    .catch(function(err) {
                        console.log(err);
                    });
            });
            socket.on('practice-progress', function(data) {
                db.setPracticeProgress(socket.email, socket.ext_id, data.slide, data.lesson)
                    .catch(function(err) {
                        console.log(err);
                    });
            });
            socket.on('practice-complete', function(data) {
                db.setPracticeComplete(socket.email, socket.ext_id, data.lesson)
                    .then(function() { socket.emit('complete-confirmation'); })
                    .catch(function(err) {
                        console.log(err);
                    });
            });
            socket.on('quiz-complete', function(data) {
                let grade = Math.floor((data.grade.answers_correct/data.grade.answers_count)*100)
                let score = Math.floor(grade*100 * (quizTime+(data.time.min+(data.time.sec/60)))/quizTime)
                let sendData = {
                    score: score,
                    answers_count: data.grade.answers_count,
                    answers_correct: data.grade.answers_correct,
                    passed: (grade >= 70.0)
                };
                
                db.setQuizInfo(socket.email, socket.ext_id, data.lesson, grade, score, JSON.stringify(data.time))
                    .then(function() { 
                        socket.emit('complete-confirmation', sendData); 
                    })
                    .catch(function(err) {
                        console.log(err);
                    });
                
            });
            socket.on('asl-frame', function(data) {
                //maybe use bitmap or other file formats instead of jpeg?
                //maybe compress the data before sending and test the model confidence with and without compression?
                //BLOB = BINARY LARGE OBJECT
                console.log(data);
            });
            socket.on('update-answer', function(data) {
                db.setPracticeAnswer(data.practice_id, data.id, `{"answers": ${JSON.stringify(data.answers)}}`, data.type)
                    .then(function() {
                        console.log("answer updated");
                    })
                    .catch(function(err) {
                        console.log(err);
                    });
            })
        } else {
            console.log("Socket connection is not logged in");
        }
    });
    /*
    db.getUserLessons(402, 1)
        .then(function(lesson) {    
            let lessonDetails = lesson.shift();
            if (lesson != undefined && lesson.length > 0) {
                let lectureDetails = lessonDetails.PID.split('-');
                let practiceDetails = lessonDetails.answers.split('-');
                let quizDetails = lessonDetails.phrases;
                let lessonData = getLessonData(lesson);
            }
            
        })
        .catch(function(err) {
            console.log(err);
        })
    */
    /*
    db.getRandomQuiz(1)
        .then(function(quiz) {
            let questions = [];
            for (let i = 0; i < quiz.length; i++) {
                questions.push(quiz[i].phrases);
            }
        })
        .catch(function(err) {
            console.log(err);
        });
    */
}

function initLessonRoutes(app) {
    app.post('/is-lesson-unlocked', isLoggedIn, function(req, res) {
        let {num, type} = req.body;
        let msg = {loggedIn: true};
        db.getUserLesson(req.session.passport.user.id, num)
            .then(function(lesson) {
                let lessonDetails = lesson.shift();
                if (lesson != undefined && lesson.length > 0) {
                    let lectureDetails = lessonDetails.PID.split('-');
                    let practiceDetails = lessonDetails.answers.split('-');
                    let quizDetails = lessonDetails.phrases;
                    let lessonData = getLessonData(lesson);
                    switch(type) {
                        case "lecture":
                            msg.unlocked = true;
                            msg.slide = lectureDetails[1];
                            msg.desc = lectureDetails[0];
                            res.json(msg);
                            break;
                        case "practice": {
                            msg.unlocked = true;
                            msg.lesson = lessonData;
                            msg.slide = practiceDetails[1];
                            res.json(msg);
                            break;
                        }
                        case "quiz": {
                            if (practiceDetails[2] == 1) {
                                db.getRandomQuiz(num)
                                    .then(function(quiz) {
                                        let questions = [];
                                        for (let i = 0; i < quiz.length; i++) {
                                            questions.push(quiz[i].phrases);
                                        }
                                        msg.unlocked = true;
                                        msg.lesson = questions;
                                        msg.time = quizTime;
                                        res.json(msg);
                                    })
                                    .catch(function(err) {
                                        console.log(err);
                                        msg.unlocked = false;
                                        msg.message = err;
                                        res.json(msg);
                                    });
                            } else {
                                msg.unlocked = false;
                                msg.message = "Finish this lesson's practice to unlock the quiz.";
                                res.json(msg);
                            }
                            break;
                        }
                    }
                } else {
                    msg.unlocked = false;
                    msg.message = "Finish the prior lesson's quiz to unlock this lesson.";
                    res.json(msg);
                }
                
            })
            .catch(function(err) {
                console.log(err);
                res.json(err);
            });
    });
}


//parsing is specific to how data is formatted in the MySQL procedure
function parseSQLJSON(sqlJSON) {
    let result = [];
    let start = "";
    let end = "";
    if (sqlJSON === null) {
        return null;
    } else if (sqlJSON.search('},{') > 0) {
        sqlJSON = sqlJSON.split('},{');
        start = "{";
        end = "}";
        
        for (let i = 0; i < sqlJSON.length; i++) {
            if (i === 0) sqlJSON[i] = `${sqlJSON[i]}${end}`;
            else if (i > 0 && i+1 < sqlJSON.length) sqlJSON[i] = `${start}${sqlJSON[i]}${end}`;
            else sqlJSON[i] = `${start}${sqlJSON[i]}`;
            result.push(JSON.parse(sqlJSON[i]))
        }
    } else if (sqlJSON.search(' | ') > 0) {
        sqlJSON = sqlJSON.split(' | ');
        for (let i = 0; i < sqlJSON.length; i++) {
            let temp1 = sqlJSON[i].split('--');
            let temp2 = JSON.parse(temp1[0]);            
            temp2.id = temp1[1];
            result.push(temp2);
        }
    } else {
        let temp = [sqlJSON];
        sqlJSON = temp;
        for (let i = 0; i < sqlJSON.length; i++) {
            if (i === 0) sqlJSON[i] = `${sqlJSON[i]}${end}`;
            else if (i > 0 && i+1 < sqlJSON.length) sqlJSON[i] = `${start}${sqlJSON[i]}${end}`;
            else sqlJSON[i] = `${start}${sqlJSON[i]}`;
            result.push(JSON.parse(sqlJSON[i]))
        }
    }
    return result;
}

function combinePhraseAnswer(phrases, answers) {
    let combined = [];
    //parse question phrases and question answers seperately
    phrases = parseSQLJSON(phrases);
    answers = parseSQLJSON(answers);
    //combine qestion phrases and question answers
    for (let i = 0; i < phrases.length; i++) {
        combined[i] = phrases[i];
        if (answers !== null)
            combined[i].answers = answers[i].answers;
        else
            combined[i].answers = null;
        combined[i].id = phrases[i].id;
    }
    return combined;
}

function getLessonData(lesson) {
    let temp = [];
    let result = [];
    //combine the phrases and answers into one JSON
    for (let i = 0 ; i < lesson.length; i++) {
        if (lesson[i].phrases && lesson[i].answers)
            temp.push(combinePhraseAnswer(lesson[i].phrases, lesson[i].answers));
    }
    //attach practice id to the before returning
    for (let i = 0; i < temp.length; i++) {
        for (let j = 0; j < temp[i].length; j++) {
            temp[i][j].practice_id = lesson[i].PID;
            result.push(temp[i][j]);
        }
    }
    
    return result;
}