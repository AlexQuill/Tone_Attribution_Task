/* eslint-disable no-useless-concat */
/* eslint-disable camelcase */
/* eslint-disable max-len */
// given experimental variables
export const id = 'random'; // use one of these three options: 'participant', 'url', 'random'
export const fullscreen = true; // Fullscreen mode or not?
export const minWidth = 800; // minimum width of the experiment window
export const minHeight = 600; // minimum height of the experiment window
export const redirect_onCompletion = false;
export const redirect_link = 'https://osf.io';

// text variables
export const page1 = [
  '<p>For this task, you will use the index finger of your dominant hand to perform a series of irregular, Morse code-like taps while listening to a sequence of tones. The tones you hear could either result from <strong>your own actions/taps </strong>, the recorded <strong>actions/taps of another individual</strong>, or <strong>varying mixtures of both</strong>. </p>' + '<br>'
  + '<p>After each 10 second trial, you will be asked to assess the proportion of control that you felt belonged to <strong>yourself</strong> versus to the <strong>other </strong>. </p>'
  + '<p>Please play the audio file below to listen to an example of a tapping sequence:</p>'
  + '<p> <i> [ play button for audio file here ] </i></p>'
  + '<p>Then, hit the <strong>Next</strong> button to begin the practice trials:</p>',
];

// instructions page 2
// Do not forget to adjust the number of blocks
// page2 = [
//  '<p> Nevertheless, it is really important that you do not wait for the stop signal to occur and that you respond as quickly and as accurately as possible to the arrows. </p>'+
//  '<p> After all, if you start waiting for stop signals, then the program will delay their presentation. This will result in long reaction times. </p>'+
//  '<p> We will start with a short practice block in which you will receive immediate feedback. You will no longer receive immediate feedback in the experimental phase. </p>'+
//  '<p> However, at the end of each experimental block, there will be a 15 second break. During this break, we will show you some information about your mean performance in the previous block.</p>' +
// '<p> The experiment consists of 1 practice block and 4 experimental blocks</p>'
// ];

// informed consent text
// export const informed_consent_text = [
//  '<p> Type your informed consent text in the text_variables.js file... </p>',
// ];

// other
export const label_previous_button = 'Previous';
export const label_next_button = 'Next';
// export const label_consent_button = 'I agree';
export const full_screen_message = '<p>The experiment will switch to fullscreen mode when you push the button below. </p>';
export const welcome_message = ['<p>Welcome to the experiment.</p>' + '<p>Press "Next" to begin.</p>'];
export const not_supported_message = ['<p>This experiment requires the Chrome or Firefox webbrowser.</p>'];
export const subjID_instructions = 'Enter your participant ID.';
// export const age_instructions = 'Enter your age.';
// export const gender_instructions = 'Choose your gender.';
// export const gender_options = ['Female', 'Male', 'Other', 'Prefer not to say'];
export const text_at_start_block = '<p>Press space to begin.</p>';
export const get_ready_message = '<p>Get ready...</p>';
// export const fixation_text = '<div style="font-size:60px;">TEST</div>';
export const end_message = '<p>Thank you for your participation.</p>'
  + '<p>Press space to finalize the experiment (redirect to XXX).</p>';
