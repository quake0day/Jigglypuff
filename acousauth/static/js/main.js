/* Copyright 2013 Chris Wilson

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

var audioContext = new AudioContext();
var audioInput = null,
    realAudioInput = null,
    inputPoint = null,
    audioRecorder = null;
var rafID = null;
var analyserContext = null;
var canvasWidth, canvasHeight;
var recIndex = 0;
var first = true;


// define additional flag
var condition_1 = false;
var condition_2 = false;

/* TODO:

- offer mono option
- "Monitor input" switch
*/

function saveAudio() {
    audioRecorder.exportWAV( doneEncoding );
    // could get mono instead by saying
    // audioRecorder.exportMonoWAV( doneEncoding );
}

function drawWave( buffers ) {
    var canvas = document.getElementById( "wavedisplay" );

    drawBuffer( canvas.width, canvas.height, canvas.getContext('2d'), buffers[0] );
}

function postResult(buffers){
    //audioRecorder.exportWAV(doneEncoding );

    //alert(buffers[0][10]);
    var myJsonString = JSON.stringify(buffers[0]);
    alert(buffers[0].length);
    $(function(){

        $(showcase).text("Posting Data...");
         $.ajax({                                                 //调用jquery的ajax方法
            type: "POST",                                     //设置ajax方法提交数据的形式
            url: "/submit",                                      
            data: myJsonString,
            contentType: "multipart/form-data",
            beforeSend: function(xhr){
                var upload = xhr.upload;
                xhr.setRequestHeader("Cache-control","no-cache");
                xhr.setRequestHeader("X-File-Name","K");
               // xhr.setRequestHeader("X-File-Size",
           },
            success: function(msg){  
                alert("SUCC");
                $(showcase).text("Success");
            }
            });


    });
    
}


function doneEncoding( blob ) {
    Recorder.forceDownload( blob, "myRecording" + ((recIndex<10)?"0":"") + recIndex + ".wav" );
    recIndex++;
}

function toggleRecording( e ) {
    if (e.classList.contains("recording")) {
        // stop recording
        audioRecorder.stop();
        e.classList.remove("recording");
        audioRecorder.getBuffers( drawWave );
    } else {
        // start recording
        if (!audioRecorder)
            return;
        e.classList.add("recording");
        audioRecorder.clear();
        audioRecorder.record();
    }
}

function startRecording() {
        // start recording

        if (!audioRecorder){
            return;
        }
        if(first == true){
            first = false;
            audioRecorder.clear();
            audioRecorder.record();
        }
}

function stopRecording() {
        // stop recording
        if(first == false){
        audioRecorder.stop();
        //e.classList.remove("recording");
        audioRecorder.getBuffers( drawWave );
        audioRecorder.getBuffers( postResult);
        //saveAudio();
        first = true;
        //saveAudio();
    }
}
function convertToMono( input ) {
    var splitter = audioContext.createChannelSplitter(2);
    var merger = audioContext.createChannelMerger(2);

    input.connect( splitter );
    splitter.connect( merger, 0, 0 );
    splitter.connect( merger, 0, 1 );
    return merger;
}

function cancelAnalyserUpdates() {
    window.webkitCancelAnimationFrame( rafID );
    rafID = null;
}

function stateChange(newState) {
    setTimeout(function(){
        if(newState == true){stopRecording();}
    }, 5000);
}



function updateAnalysers(time) {
    if (!analyserContext) {
        var canvas = document.getElementById("analyser");
        canvasWidth = canvas.width;
        canvasHeight = canvas.height;
        analyserContext = canvas.getContext('2d');
    }

    // analyzer draw code here
    {
        var SPACING = 3;
        var BAR_WIDTH = 1;
        var numBars = Math.round(canvasWidth / SPACING);
        var freqByteData = new Uint8Array(analyserNode.frequencyBinCount);

        analyserNode.getByteFrequencyData(freqByteData); 

        analyserContext.clearRect(0, 0, canvasWidth, canvasHeight);
        analyserContext.fillStyle = '#F6D565';
        analyserContext.lineCap = 'round';
        var multiplier = analyserNode.frequencyBinCount / numBars;

        // Draw rectangle for each frequency bin.
        for (var i = 0; i < numBars; ++i) {
            var magnitude = 0;
            var offset = Math.floor( i * multiplier );
            // gotta sum/average the block, or we miss narrow-bandwidth spikes
            for (var j = 0; j< multiplier; j++)
                magnitude += freqByteData[offset + j];
            magnitude = magnitude / multiplier;

            var magnitude2 = freqByteData[i * multiplier];

            // CHANGE HERE
            //check amplitude and frequency
            // if it is bigger than certain threshold then ...

            // i represents frequency
            // magnitude represents amplitude


            // condition 1
            if(i > 50 && i < 90){
            if(magnitude >= 150){
                //broadcast noise
                condition_1 = true;
        }
            // condition 2
            if(i > 50 && i < 80){
                if(magnitude >= 110){
                    condition_2 = true;
                }
            }

            // judge if both OK
            if(condition_1 == true && condition_2 == true){
                // Do something
                startRecording();
                stateChange(condition_1);
                resetCondition();
            }
    }
            analyserContext.fillStyle = "hsl( " + Math.round((i*360)/numBars) + ", 100%, 50%)";
            analyserContext.fillRect(i * SPACING, canvasHeight, BAR_WIDTH, -magnitude);
        }
    }
    
    rafID = window.webkitRequestAnimationFrame( updateAnalysers );
}

function resetCondition(){
    condition_1 = false;
    condition_2 = false;
}

function toggleMono() {
    if (audioInput != realAudioInput) {
        audioInput.disconnect();
        realAudioInput.disconnect();
        audioInput = realAudioInput;
    } else {
        realAudioInput.disconnect();
        audioInput = convertToMono( realAudioInput );
    }

    audioInput.connect(inputPoint);
}

function gotStream(stream) {
    inputPoint = audioContext.createGain();

    // Create an AudioNode from the stream.
    realAudioInput = audioContext.createMediaStreamSource(stream);
    audioInput = realAudioInput;
    audioInput.connect(inputPoint);

//    audioInput = convertToMono( input );

    analyserNode = audioContext.createAnalyser();
    analyserNode.fftSize = 2048;
    inputPoint.connect( analyserNode );

    audioRecorder = new Recorder( inputPoint );

    zeroGain = audioContext.createGain();
    zeroGain.gain.value = 0.0;
    inputPoint.connect( zeroGain );
    zeroGain.connect( audioContext.destination );
    updateAnalysers();
}

function initAudio() {
        if (!navigator.getUserMedia)
            navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

    navigator.getUserMedia({audio:true}, gotStream, function(e) {
            alert('Error getting audio');
            console.log(e);
        });
}

window.addEventListener('load', initAudio );
