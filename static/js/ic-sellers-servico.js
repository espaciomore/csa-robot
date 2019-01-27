$( document ).ready(function()
{
	// TODO: build a stack of interactions so it is handled synchronously

	// TODO: greet the customer before beginning
	var greetCustomer = function()
	{
		var greetings = [ 'oi', 'olá'];
		var greetingQuestions = [ 'como vai', 'tudo bem', 'tudo bom', 'tudo certo'];

		updateAgentSpeech( '' + greetings.getRandomOne().capitalize() + '! ' + getDaytimeGreeting().capitalize() + ', ' + greetingQuestions.getRandomOne() + '?');

		addTextEntryInput('customer-mood', '~');
		addTextEntrySubmit('customer-mood-submit');

		setTextEntriesEvents('customer-mood', 'customer-mood-submit', function(){ 
			defaultAgentInteraction.call(); 
		});

		openEntrySpeech(getTimeout(2));	
	}

	// TODO: create an question and answer loop
	var defaultAgentInteraction = function()
	{
		var modelRequests = ['É um prazer responder suas perguntas sobre "Instacarro"', 
			'indique qualquer dúvida sobre "Instacarro"', 
			'estou aqui para responder suas perguntas sobre "Instacarro"',
			'não hesite em publicar suas perguntas sobre "Instacarro"',
			'pergunte-me qualquer coisa sobre "Instacarro"'];

		updateAgentSpeech('' + modelRequests.getRandomOne().capitalize() + '!', getTimeout(2));
		updateAgentSpeech('Use o "?" botão para fazer perguntas.', getTimeout(3));

		activateQuestionButton.call();
	}
	
	var activateQuestionButton = function()
	{
		setTimeout( function() 
		{ 
			addQuestionEntrySubmit('customer-question-submit');
			
			setQuestionEntryEvents('customer-question-submit', function(){
				customerTextEntryInteraction.call();
			});
			
			openEntrySpeech(getTimeout(2));
		}, 500);
	}

	var customerTextEntryInteraction = function() 
	{
		var notfoundAcknowledgements = ['preciso de mais tempo para lhe dar uma resposta',
			'nao sei a resposta agora',
			'me desculpe, mas não sei disso no momento'];

		addTextEntryInput('customer-question', '~');
		addTextEntrySubmit('customer-question-submit');

		setTextEntriesEvents('customer-question', 'customer-question-submit', function(){

				var question = $('[name="customer-question"]').val();
				var answer = '';

				$.post('/answers', { "question": question })
				.done(function(data) 
				{
					if ( !data.hasOwnProperty('answer') ) {
						// TODO: send the question to support e-mail
						answer = '' + notfoundAcknowledgements.getRandomOne().capitalize() + '.';
						updateAgentSpeech(answer, getTimeout(answer.length / 50));
					} else {
						answer = data.answer;
						updateAgentSpeech(answer, getTimeout(answer.length / 50));
					}
				})
				.fail(function(err)
				{
					// TODO: send the question to support e-mail
					answer = 'Detetei um problema de rede, tente novamente novamente depois de atualizar esta página.';
					updateAgentSpeech(answer, getTimeout(6));
					console.log(err);
				})
				.always(function()
				{
					// TODO: send to button "?"
					activateQuestionButton.call();
				});
			}
		);

		openEntrySpeech(getTimeout(2));
	}
		
	// TODO: define the customer interaction for the agent
	greetCustomer();
	// TODO: invite to ask question by using the button "?"
});