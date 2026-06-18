var condition = _.sample(["list1", "list2", "list1_r", "list2_r"]) // sample function picks out one randomly

var shuffle = function (array) {
 
  var currentIndex = array.length;
  var temporaryValue, randomIndex;
  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
 
  return array;
 
};

var trial_counter = 0;

function build_trials() {
  var condition_list = [] //my addition through line 12
  for (var i = 0; i < 12; i++) {
    var random = _.sample([1,2,3,4])
    condition_list.push(((i + 1)* 10) + random)
  }
  for (var i = 0; i < 24; i++) {
    condition_list.push(1000 + i + 1)
  }
  console.log(condition_list) // requires shuffling still
  shuffle(condition_list)
  console.log(condition_list)
  const condition_strings = condition_list.map(num => num.toString());
  const presentation_list = condition_strings.map((integer) => full_stimuli.find((item) => item.trial_id === integer));
  return presentation_list


}



function make_slides(f) {
  var   slides = {};

  slides.i0 = slide({
     name : "i0",
     start: function() {
      exp.startT = Date.now();
     }
  });

  slides.instructions = slide({
    name : "instructions",
    button : function() {
      exp.go(); //use exp.go() if and only if there is no "present" data.
    }
  });
    slides.instructions2 = slide({
    name : "instructions2",
    button : function() {
      exp.go(); //use exp.go() if and only if there is no "present" data.
    }
  });
    slides.instructions3 = slide({
    name : "instructions3",
    button : function() {
      exp.go(); //use exp.go() if and only if there is no "present" data.
    }
  });


  slides.trial = slide({
    name: "trial",
    present: exp.train_stims,
    present_handle: function(stim) {
      this.stim = stim;
      this.position = 0;
            
      $("#comprehension-question").hide();
      
      
      var html = "";
      
      for (var i = 0; i < stim.words.length; i++) {
        var word = stim.words[i];
        var masked_word = word.form.replace(/./g, "-") + " ";
        html += "<span data-form=\"" + word.form + " \" data-masked-form=\"" + masked_word + "\"  id=\"stimulus-word-" + i + "\">" +  masked_word + "</span>"
        if (word.lbr_after) {
          html += "<br>"
        }
      }
      
      
      this.response_times = [];
      
      $("#stimulus-sentence").html(html);
      
      
      var t = this;
      
      $("#comprehension-question").hide();
            
      $(document).bind("keydown", function(evt) {
        if (evt.keyCode == 32) {          
          evt.preventDefault();
          t.response_times.push(Date.now());
          if (t.position > 0) {
            var prev_idx = t.position - 1;
            $("#stimulus-word-" + prev_idx).text($("#stimulus-word-" + prev_idx).data("masked-form"));
          }
          if (t.position < t.stim.words.length) {
            $("#stimulus-word-" + t.position ).text($("#stimulus-word-" + t.position ).data("form")); 
          } else {
            $("#comprehension-question").show();
            $(document).unbind("keydown");
          }
          t.position++;
        }
        
      });
console.log("stim:", stim);
console.log("question:", stim.question_attribtute);
console.log("question element exists:", $("#comprehension-question-q").length);

$("#comprehension-question-q").text(stim.question_attribtute);
      $("#comprehension-question-q").text(stim.question_attribute);
      
  

    },
    button : function(response) {
        this.response_correct =
           response.toUpperCase() == this.stim.correct_answer.toUpperCase();
      this.log_responses();
      _stream.apply(this);
    },

    log_responses : function() {
      for (var i = 0; i < this.stim.words.length; i++) {
        var word = this.stim.words[i];
        exp.data_trials.push({
          "trial_id": this.stim.trial_id,
          "word_idx": i,
          "form": word.form,
          "region": word.region,
          "lbr_before": word.lbr_before ? 1 : 0,
          "lbr_after": word.lbr_after ? 1 : 0,
          "rt": this.response_times[i+1] - this.response_times[i], 
          "type": this.stim.type,
          "response_correct": this.response_correct ? 1 : 0,
          "trial_no": trial_counter
        }); 
      }
      trial_counter++;
    }
  });

  


  slides.subj_info =  slide({
    name : "subj_info",
    submit : function(e){
      //if (e.preventDefault) e.preventDefault(); // I don't know what this means.
      exp.subj_data = {
        language : $("#language").val(),
        name : $("#name").val(),
        gender : $('#gender').val(),
        tirednesslvl : $('#tirednesslvl').val(),
        age : $("#age").val()
      };
      exp.go(); //use exp.go() if and only if there is no "present" data.
    }
  });

  slides.thanks = slide({
    name : "thanks",
    start : function() {
      exp.data= {
          "trials" : exp.data_trials,
          "catch_trials" : exp.catch_trials,
          "system" : exp.system,
          "condition" : exp.condition,
          "subject_information" : exp.subj_data,
          "time_in_minutes" : (Date.now() - exp.startT)/60000
      };
      setTimeout(function() {proliferate.submit(exp.data);}, 1000);
    }
  });

  return slides;
}

/// init ///
function init() {
  exp.condition = condition;
  exp.trials = [];
  exp.catch_trials = [];
  exp.train_stims = build_trials(); //can randomize between subject conditions here
  exp.system = {
      Browser : BrowserDetect.browser,
      OS : BrowserDetect.OS,
      screenH: screen.height,
      screenUH: exp.height,
      screenW: screen.width,
      screenUW: exp.width
    };
  //blocks of the experiment:
  exp.structure=["i0",  "instructions", "instructions2", "instructions3", "trial", 'subj_info', 'thanks'];

  exp.data_trials = [];
  //make corresponding slides:
  exp.slides = make_slides(exp);

  exp.nQs = utils.get_exp_length(); //this does not work if there are stacks of stims (but does work for an experiment with this structure)
                    //relies on structure and slides being defined

  $('.slide').hide(); //hide everything

  //make sure turkers have accepted HIT (or you're not in mturk)
  $("#start_button").click(function() {
    if (turk.previewMode) {
      $("#mustaccept").show();
    } else {
      $("#start_button").click(function() {$("#mustaccept").show();});
      exp.go();
    }
  });

  $(".response-buttons, .test-response-buttons").click(function() {
    _s.button($(this).val());
  });

  exp.go(); //show first slide
}
