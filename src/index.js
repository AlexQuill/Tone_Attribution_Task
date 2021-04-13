/* eslint-disable import/no-unresolved */
/* eslint-disable import/extensions */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-useless-concat */
/* eslint-disable no-shadow */
/* eslint-disable no-param-reassign */
/* eslint-disable max-len */
/* eslint-disable camelcase */

// CDN attempt
// import { Tone } from 'https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.15/Tone.js';
// import { $ } from 'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js';
// import { bowser } from 'https://cdnjs.cloudflare.com/ajax/libs/bowser/2.11.0/bundled.js';

// Local imports attempt
import * as Tone from '../node_modules/tone';
import bowser from '../node_modules/bowser/src/bowser.js';
import * as variables from './text-variables.js';

// Browserify Attempt
// const bowser = require('bowser');
// const $ = require('jquery');
// const Tone = require('tone');
// const variables = require('text-variables');


const jsPsych = window.jsPsych;

// returning random integer determining level of agency, on given scale (used on each tap and compared to threshold)
function randInt(min, max) { // choose a random integer between the ceiling of the min and the floor of the max
  const nmin = Math.ceil(min);
  const nmax = Math.floor(max);
  return Math.floor(Math.random() * (nmax - nmin + 1)) + nmin;
}

// is the experiment running from a server or not? (this determines if data is saved on server or offline)

// initialize variables
// export const trial_ind = 1; // trial indexing variable starts at 1 for convenience
// export const block_ind = 0; // block indexing variables: block 0 is considered to be the practice block
// track key presses + offset of when tone plays for each
// allows audio context to start - not sure if should be here or when initializing jspsych (will test)

// storing delays
const timePress = []; // holds always-increasing delays of clicks from start of trial [1.0, 1.9, 2.5, 6.0, 7.1...]
const playback = []; // holds first fifty intervals between clicks [0, 0.5, 0.25, 0.8, 1.6, 0.5...]
const agencyPerTrial = [50, 90, 20, 70, 10, 80, 0, 30, 40, 60];
let presses = 0;

// Tone variables
Tone.start();
const synth = new Tone.Synth().toDestination();
const delsynth = new Tone.Synth().toDestination();
const eff = new Tone.Synth().toDestination();
const distortion = new Tone.Distortion(0.4).toDestination();
eff.connect(distortion);

// participant variables
let focus = 'focus'; // tracks if the current tab/window is the active tab/window, initially the current tab should be focused
let fullscr_ON = 'no'; // tracks fullscreen activity, initially not activated
const redirect_timeout = 1500; // set this so that data is saved before redirect!
let online = false;
if (document.location.host) { // returns your host or null
  online = true;
}

const timeline = []; // this array stores the events we want to run in the experiment

// each trial in the "jspsych.data" object will have these properties. Nice for keeping track of screen size, resolution, os
jsPsych.data.addProperties({ // add these variables to all rows of the datafile
  browser_name: bowser.name,
  browser_version: bowser.version,
  os_name: bowser.osname,
  os_version: bowser.osversion,
  tablet: String(bowser.tablet),
  mobile: String(bowser.mobile),
  // convert explicitly to string so that "undefined" (no response) does not lead to empty cells in the datafile
  screen_resolution: `${jsPsych.width} x ${jsPsych.height}`,
  window_resolution: `${window.innerWidth} x ${window.innerHeight}`, // this will be updated throughout the experiment

});

const welcome = {
  type: 'instructions',
  pages: variables.welcome_message,
  show_clickable_nav: true,
  allow_backward: false,
  button_label_next: variables.label_next_button,
  on_start(trial) {
    console.log(bowser.name);
    if (bowser.name === 'Firefox' || bowser.name === 'Chrome' || bowser.name === 'e') {
      trial.pages = variables.welcome_message;
    } else {
      trial.pages = variables.not_supported_message;
      // eslint-disable-next-line no-restricted-globals
      setTimeout(() => { location.href = 'html/not_supported.html'; }, 2000);
    }
  },
};

// these events turn fullscreen mode on in the beginning and off at the end, if enabled (see experiment_variables.js)
const fullscr = {
  type: 'fullscreen',
  fullscreen_mode: true,
  message: variables.full_screen_message,
  button_label: variables.label_next_button,
};

const fullscr_off = {
  type: 'fullscreen',
  fullscreen_mode: false,
  button_label: variables.label_next_button,
};

// if enabled below, get participant's id from participant and add it to the datafile.
// the prompt is declared in the configuration/text_variables.js file
const participant_id = {
  type: 'survey-text',
  questions: [{
    prompt: variables.subjID_instructions,
    required: true,
  }],
  button_label: variables.label_next_button,
  on_finish(data) {
    const responses = JSON.parse(data.responses);
    const code = responses.Q0;
    jsPsych.data.addProperties({
      participantID: code,
    });
  },

};

// instruction trial
// the instructions are declared in the configuration/text_variables.js file
const instructions = {
  type: 'instructions',
  pages: [variables.page1],
  show_clickable_nav: true,
  button_label_previous: variables.label_previous_button,
  button_label_next: variables.label_next_button,
};

// start block
const block_start = {
  type: 'html-keyboard-response',
  stimulus: variables.text_at_start_block,
  choices: ['space'],
};

// get ready block
const block_get_ready = {
  type: 'html-keyboard-response',
  stimulus: variables.get_ready_message,
  choices: jsPsych.NO_KEYS,
  trial_duration: 2000,
};

const intro_trial = {
  stimulus: 'Click this button to get started. Please press spacebar 50 times, and listen to the tone play.',
  type: 'jspsych-detect-held-down-keys',
  choices: ['space'],
  loop_function(data) {
    Tone.start();
    // eslint-disable-next-line no-loop-func
    $('#0').on('keydown', (e) => {
      if (e.keyCode === 32 && presses < 50) {
        timePress.push(Tone.now()); // time of click
        if (presses === 0) {
          playback.push(0); // holds time intervals between presses
        } else {
          playback.push(Tone.now() - timePress[presses - 1]); // current time - time of last click
        }
        synth.triggerAttackRelease('C4', '8n', Tone.now() + 0.015);
        presses += 1;
      } else {
        console.log('first array of 50 keypress intervals: ');
        console.log(playback);
        // return false here?
      }
    });
  },
};

// only ask for participant id if 'id' = 'particpant' (experiment_variables.js)
// if 'id' = 'url', get it from url; otherwise, generate random value
// only go into fullscreen mode if 'fullscreen' is true
const start_timeline = [];

if (variables.id === 'participant') { // if they are a participant, add to the start_timeline object
  if (variables.fullscreen) {
    start_timeline.push(welcome, participant_id, fullscr, instructions, intro_trial);
  } else {
    start_timeline.push(welcome, participant_id, instructions, intro_trial);
  }
} else {
  if (variables.id === 'url') {
    const urlvar = jsPsych.urlVariables();
    const code = urlvar.subject;
    jsPsych.data.addProperties({ participantID: code });
  } else {
    const code = jsPsych.randomization.randomID(); jsPsych.data.addProperties({ participantID: code });
  }
  if (variables.fullscreen) {
    start_timeline.push(welcome, fullscr, instructions, intro_trial);
  } else {
    start_timeline.push(welcome, instructions, intro_trial);
  }
}

// trial block
const single_trial = {
  type: 'html-keyboard-response',
  trial_duration: 10000, // waits for a response for this long
  response_ends_trial: false, // response doesn't end trial, just keeps going
  stimulus: 'Please press spacebar to generate tones for this 10s trial',
  choices: ['space'],
  // eslint-disable-next-line func-names
  loop_function() { // not sure if this is quite correct
    console.log('in loop');
    let started = false;
    let i = 0;
    if (jsPsych.time_elapsed >= 10000) { // don't think this should ever run?
      i += 1;
    }
    // Tone.start(); // Alex got rid of this
    let index = 0;
    $('#experiment').on('keydown', (e) => {
      console.log('clicked');
      if (started === false) {
        started = true;
        Tone.start(); // we did this right above?
      }
      // will use jsPsych to put these into 10s blocks and switch agency level threshold
      if (e.keyCode === 32) {
        const mod = randInt(0, 90); // random number between 0, 90
        console.log(`randomly generated number on press: ${mod}`);
        console.log(`agency threshold: ${agencyPerTrial[i]}`);
        /*
          our agencyPerTrial list has ten "levels" here, randomly ordered.
          The trial we're currently on out of 10 "randomizes" to that agency level
          Mod is the random number. If it is above that agency level, then we add a delay. If not, no delay
        */
        if (mod < agencyPerTrial[i]) { // NO DELAY
          synth.triggerAttackRelease('C4', '8n', Tone.now() + 0.015); // play tone immediately
          // tonePlay.push(0.015);
        } else { // DELAY
          const pick = randInt(index, index + 49);
          console.log(`interval selected from random array: ${playback[pick]}`); // choose from the random "intro trials" to delay
          delsynth.triggerAttackRelease('C4', '8n', Tone.now() + playback[pick]); // delays by this much
        }
        timePress.push(Tone.now());
        if (index === 0) {
          playback.push(0);
        } else {
          playback.push(Tone.now() - timePress[presses - 1]);
        }
        index += 1;
        presses += 1;
      }
      return true;
    });
  },
};

// feedback block
const response_trial = {
  type: 'html-slider-response',
  stimulus: '<p>Assess the proportion of control you felt belonged to self versus other. </p>',
  labels: ['<strong>Self</strong>', '<strong>Other</strong>'],
  prompt: '',
  button_label: 'Submit',
};

// goodbye block, this is all pulled from the stop signal
// I do not believe this needs to actually exist. 
// Instead, it seems like the "on_finish" function at the very bottom of this file should be used to send data.
// leaving the code here for posterity
const goodbye = {
  type: 'html-keyboard-response',
  stimulus: variables.end_message,
  on_start(data) {
    console.log(data);
    const subjID = jsPsych.data.get().last(1).values()[0].participantID;
    // const full_data = jsPsych.data.get();
    const ignore_columns = ['raw_rt', 'trial_type', 'first_stimulus', 'second_stimulus', 'onset_of_first_stimulus',
      'onset_of_second_stimulus', 'key_press', 'correct_response', 'trial_index', 'internal_node_id'];
    const rows = { trial_type: 'custom-stop-signal-plugin' }; // we are only interested in our main stimulus, not fixation, feedback etc.
    const selected_data = jsPsych.data.get().filter(rows).ignore(ignore_columns);
    // the next piece of codes orders the columns of the data file
    const d = selected_data.values(); // get the data values
    // make an array that specifies the order of the object properties
    const arr = ['participantID', 'block_i', 'trial_i', 'stim', 'signal', 'SSD', 'response', 'rt', 'correct', 'focus', 'Fullscreen',
      'time_elapsed', 'browser_name', 'browser_version', 'os_name', 'os_version', 'tablet', 'mobile', 'screen_resolution', 'window_resolution'];
    // const new_arr = []; // we will fill this array with the ordered data

    // do it for the whole data array
    for (let i = 0; i < d.length; i += 1) {
      const obj = d[i]; // get one row of data
      const new_obj = {}; // copy over selected data rows into new_obj
      // each of the above arr columns will get its key:value from the d dictionary
      arr.forEach((item) => {
        new_obj[item] = obj[item];
        return new_obj;
      }); // for each element in the array run my function
      selected_data.values()[i] = new_obj; // insert the ordered values back in the jsPsych.data object
    }
    if (!online) {
      selected_data.localSave('csv', `SST_data_${subjID}.csv`);
    }
  },

};

// start the experiment with the previously defined start_timeline trials
const start_procedure = {
  timeline: start_timeline,
};

const trial_procedure = {
  timeline: [single_trial, response_trial],
  // timeline_variables: indexes,
};

// ten trials make a block
const block_procedure = {
  timeline: [block_start, block_get_ready, trial_procedure],
  randomize_order: false,
  repetitions: 10, // add one because the first block is the practice block
};

// end of the experiment
const end_timeline = [];
if (variables.fullscreen) {
  end_timeline.push(fullscr_off, goodbye);
} else {
  end_timeline.push(goodbye);
}

const end_procedure = {
  timeline: end_timeline, // here, you could add questionnaire trials etc...
};

/* The overall timeline contains:
  - start procedure:
    - welcome
    - check for fullscreen (optional)
    - instructions
    - 50 intro trials
  - block procedure:
    - ten loops of:
      - press button + get delay/no delay for tone
      - assess responsibility for tone
  - end procedure:
    - turn off fullscreen (optional)
    - goodbye:
      - iterate over data
      - format, localsave
*/

timeline.push(start_procedure, block_procedure, end_procedure);

/* #########################################################################

the functions that save the data and initiates the experiment

######################################################################### */

// function that pushs data to an existing file (or creates the file if it does not exist)
// this posts the data to some server side endpoint
function appendData(filename, filedata) {
  $.ajax({ // make sure jquery-1.7.1.min.js is loaded in the html header for this to work
    type: 'post',
    cache: false,
    url: 'https://rcweb.dartmouth.edu/RoskiesA/processing_append.php', // IMPORTANT: change the php script to link to the directory of your server where you want to store the data!
    data: {
      filename,
      data: filedata,
      task: 'stop_signal', // what's up with this?
      pid: '<?php echo $userID ?>',
    },
  });
}

// run the experiment!

// looks to be copy pasted from stop signal code
jsPsych.init({
  timeline, // timeline for the exp
  display_element: 'experiment', // html element to display
  on_data_update(data) { // runs each time the data is updated, even by a plugin:
    // write the current window resolution to the data
    data.window_resolution = `${window.innerWidth} x ${window.innerHeight}`;
    // is the experiment window the active window? (focus = yes, blur = no)
    data.focus = focus; data.Fullscreen = fullscr_ON;
    // append a subset of the data each time a go or stop stimulus is shown (the custom-stop-signal-plugin)
    const id_index = 2;
    // point in experiment when particpant id is manually entered. see 'start_timeline'
    if (online) {
      const subjID = jsPsych.data.get().last(1).values()[0].participantID;
      let data_row = '';
      if (data.trial_index === id_index) { // write header
        data_row = 'participantID,block_i,trial_i,stim,signal,SSD,response,rt,correct,'
                      + 'focus,Fullscreen,time_elapsed,browser_name,browser_version,os_name,os_version,'
                      + 'tablet,mobile,screen_resolution,window_resolution\n';
        appendData(`SST_data_${subjID}.csv`, data_row);
        // seems like this should write out a new row of data for each time something happens in the plugins
        // What kind of data do we want to be keeping track of?
      } else if (data.trial_type === 'custom-stop-signal-plugin') { // append data each stimulus
        data_row = `${data.participantID},${data.block_i},${data.trial_i},${
          data.stim},${data.signal},${data.SSD},${data.response},${data.rt},${data.correct},${
          data.focus},${data.Fullscreen},${data.time_elapsed},${data.browser_name},${
          data.browser_version},${data.os_name},${data.os_version},${data.tablet},${data.mobile},${
          data.screen_resolution},${data.window_resolution}\n`;
        appendData(`SST_data_${subjID}.csv`, data_row); // adds row to a CSV
      }
    }
  },

  // not sure what this does, seems extraneous
  // eslint-disable-next-line consistent-return
  on_interaction_data_update(data) { // interaction data logs if participants leaves the browser window or exits full screen mode
    const interaction = data.event;
    if (interaction.includes('fullscreen')) {
      // some unhandy coding to circumvent a bug in jsPsych that logs fullscreenexit when actually entering
      if (fullscr_ON === 'no') {
        fullscr_ON = 'yes';
        return fullscr_ON;
      } else if (fullscr_ON === 'yes') {
        fullscr_ON = 'no';
        return fullscr_ON;
      }
    } else if (interaction === 'blur' || interaction === 'focus') {
      focus = interaction;
      return focus;
    }
  },

  exclusions: { // browser window needs to have these dimensions, if not, participants get the chance to maximize their window, if they don't support this resolution when maximized they can't particiate.
    min_width: variables.minWidth,
    min_height: variables.minHeight,
  },

  // when the jspsych timeline runs out
  on_finish(data) { // holds all data in experiment
    // Serialize the data
    console.log(data);
    // if necessary, add the response + interval to each row
    const promise = new Promise(((resolve, reject) => {
      const data = jsPsych.dataAsCSV(); // turn it into a CSV
      resolve(data);
    }));

    promise.then((data) => {
      $.ajax({
        type: 'POST',
        url: 'https://rcweb.dartmouth.edu/RoskiesA/processing.php',
        data: {
          data,
          task: 'stopsignal',
          pid: '<?php echo $userID ?>',
        },
        success(result) {
          console.log(`good${result}`);
          document.location = 'next.html';
        },
        dataType: 'application/json',

        // Endpoint not running, local save
        error(err) {
          if (err.status === 200) {
            document.location = '/next.html';
          } else {
            // If error, assue local save
            jsPsych.localSave('stopsignal_results.csv', 'csv');
          }
        },
      });
    });
    if (variables.redirect_onCompletion) {
      // eslint-disable-next-line no-implied-eval
      setTimeout(`location.href = '${variables.redirect_link}';`, redirect_timeout); // redirect to another URL with a certain delay, only when redirect_onCompletion is set to 'true'
    }
  },
});

console.log('all done');
