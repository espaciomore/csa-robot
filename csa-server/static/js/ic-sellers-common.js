var locale = 'pr-BR';
var currency = { 
	minimumFractionDigits: 2,
  	style: 'currency', 
  	currency: 'BRL' 
  };
var daysOfTheWeek = {
	'monday':'segunda-feira', 
	'tuesday':'terça-feira', 
	'wednesday':'quarta-feira', 
	'thursday':'quinta-feira', 
	'friday':'sexta-feira', 
	'saturday':'sabado', 
	'sunday':'domingo'
  };


var timeout = 0;

function getTimeout(t) 
{ 
	return (timeout += (t !== undefined ? t : (timeout == 0 ? 1 : 3)))  
}

function resetTimeout() 
{ 
	timeout = 0 
}

this.getDaytimeGreeting = function() 
{
	var current_hour = (new Date()).getHours();

	if ( current_hour < 12 ) {
		return 'bom dia';
	} else if ( current_hour < 18 ) {
		return 'boa tarde';
	} else {
		return 'boa noite';
	}
}

$.fn.sortOptions = function(order){
	if (order === undefined) order = -1;
    $(this).each(function(){
        var op = $(this).children("option");
        op.sort(function(a, b) {
            return a.text > b.text ? order*1 : order*(-1);
        })
        return $(this).empty().append(op);
    });
}

this.updateSpeechBubble = function(type, text, pclass, seconds) 
{
	try {
		setTimeout( function(){
			var bubble = $('<li></li>').addClass('' + type + '-speech center-element hide');
			var pText = $('<p></p>').addClass('show').addClass(pclass);

			$('ul.chat').last().append(bubble);
			$('li.' + type + '-speech').last().append(pText);
			$('li.' + type + '-speech').last().switchClass( "hide", "show", 100, "easeInOutQuad");
			$('li.' + type + '-speech').last().find('p').text(text);

			$('li.' + type + '-speech').last().find('p').on('animationend', function(e){
				$(e.target).attr('style', 'white-space: normal !important;');
				e.stopPropagation();
			});

			windowScrollBottom();
		}, 
		seconds * 1000);
	} catch (err) {
		console.log(err);
	}
}

this.updateAgentSpeech = function(text, seconds) 
{
	windowScrollBottom();
	updateSpeechBubble('agent', text, 'typewriter', seconds !== undefined ? seconds : getTimeout(1));
}

this.updateCustomerSpeech = function(text) 
{
	resetTimeout();
	closeEntrySpeech();
	updateSpeechBubble('customer', text, '', getTimeout(1/10));
}

this.toggleEntrySpeech = function(before, after, seconds) 
{
	try {
		setTimeout( function() {
			$('.entry-speech').switchClass( before, after, 100, 'easeInOutQuad');
		}, seconds * 1000);
	} catch (err) {
		console.log(err);
	}
}

this.openEntrySpeech = function(seconds) 
{
	toggleEntrySpeech('hide', 'show', seconds !== undefined ? seconds : getTimeout(1/10));
	setTimeout(windowScrollBottom, getTimeout(1/100) * 1000);
	setTimeout(giveEntryTextFocus, getTimeout(1) * 1000);
}

this.closeEntrySpeech = function() 
{ 
	toggleEntrySpeech('show', 'hide', getTimeout(1/1000)) 
}

this.removeAllEntries = function() 
{
	setTimeout( function() {
		$('.entry-speech > *').addClass('removed');
	}, getTimeout(1/100));
}

this.isEntrySpeechActive = function()
{ 
	return $('.entry-speech').is(':visible') 
}

this.windowScrollBottom = function() 
{
	window.scrollTo(0,document.querySelector('.chat').scrollHeight);
}

this.giveEntryTextFocus = function() 
{
	var input = $('div.entry-speech > *:not(.removed)').first();
	if ( !input.is('button') ) input.focus();
}

this.addTextEntryInput = function(name, placeholder, pattern) 
{
	$('[name="' + name + '"]').remove();
	var input = $('<input/>').attr('name', name)
		.attr('type', 'text')
		.attr('placeholder', placeholder)
		.attr('pattern', pattern)
		.addClass('text-entry');
	$('.entry-speech').append(input);
}

this.addTextEntrySubmit = function(name, classname) 
{
	$('[name="' + name + '"]').remove();
	var button = $('<button></button>').attr('name', name).attr('type', 'submit').addClass('text-submit').text('Enviar');
	$('.entry-speech').append(button);
}

this.addQuestionEntrySubmit = function(name, classname) 
{
	$('[name="' + name + '"]').remove();
	var button = $('<button></button>').attr('name', name).attr('type', 'submit').addClass('text-submit').text('?');
	$('.entry-speech').append(button);
}

this.addOptionEntrySelect = function(name, defaultText) 
{
	$('[name="' + name + '"]').remove();
	var select = $('<select></select>').attr('name', name).attr('type', 'select-one').addClass('select-entry');
	var defaultOption = $('<option selected></option>').val('').text(defaultText);
		select.append(defaultOption);
	$('.entry-speech').append(select);
}

this.setTextEntriesEvents = function(inputName, submitName, eventCallback) 
{
	var submitEntries = function(e) 
	{
		var userInput = $('[name="'+ inputName +'"]');
		var userSubmit = $('[name="' + submitName + '"]');
		var pattern = userInput.attr('pattern');
		if ( pattern ) {
			var regExpParts = pattern.replace(/^\/(.+)\/([A-za-z])?$/, "$1:~:$2").split(':~:');
			var value = userInput.val();
			if ((e.which > 64 && e.which < 123) || (e.which > 47 && e.which < 58) || e.which === 32) {
                value += String.fromCharCode(e.which);
            }
			if ( !value.match(new RegExp(regExpParts[0], regExpParts[1])) ) {
				userInput.switchClass('', 'error', 100);
				userInput.switchClass('error', '', 100);
				return;
			}
		}
		if( (e.type === 'click' || e.type === 'change' || e.which === 13) && userInput.val() !== '' ) {
			if ( e.target.type !== 'select-one' ) {
				e.stopPropagation();
				updateCustomerSpeech( userInput.val() );
				userInput.addClass('removed');
				userSubmit.addClass('removed');
				eventCallback();
			}
		} else {
			e.stopPropagation();
		}
	};
	
	var userInput = $('[name="' + inputName + '"]');
	if ( userInput.is('input') ) userInput.on('keypress', submitEntries);
	if ( userInput.is('select') ) userInput.on('change', submitEntries);
	$('[name="' + submitName + '"]').on('click', submitEntries); // pointerover
}

this.setQuestionEntryEvents = function(submitName, eventCallback) 
{
	var submitEntries = function(e) 
	{
		if( e.type === 'pointerover') {
			e.stopPropagation();
			$('[name="' + submitName + '"]').addClass('removed');
			eventCallback();
		}
	};
	
	$('[name="' + submitName + '"]').on('pointerover', submitEntries);
}