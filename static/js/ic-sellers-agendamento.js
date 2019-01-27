$( document ).ready(function()
{
	// TODO: build a stack of interactions so it is handled synchronously
	var searchParams = new URLSearchParams(window.location.search);
	var location = 'https://sandbox-api.instacarro.com';
	var referer = { params: "", searchParams: {}, utm: {} };

	if( searchParams.has('referralLink') )
	{
		var metaReferer = $('meta[name=referer]')[0].content;
		if( metaReferer.split('?').length > 0 )
		{
			var parts = metaReferer.split('?');
			ic_sellers_register_model.inspection.source = parts[0];
			referer.params = parts[1];
			referer.searchParams = new URLSearchParams(referer.params);
			referer.utm = {
				source: referer.searchParams.get('utm_source'),
				campaign: referer.searchParams.get('utm_campaign'),
				content: referer.searchParams.get('utm_content'),
				medium: referer.searchParams.get('utm_medium'),
				term: referer.searchParams.get('utm_term')
			};
			console.log({
				nome: referer.searchParams.get('nome'),
				email: referer.searchParams.get('email'),
				utm: referer.utm
			});
		}
	}

	// TODO: greet the customer before beginning
	var greetCustomer = function(){
		var greetings = [ 'oi', 'olá'];
		var greetingQuestions = [ 'como vai', 'tudo bem', 'tudo bom', 'tudo certo'];

		updateAgentSpeech( '' + greetings.getRandomOne().capitalize() + '! ' + getDaytimeGreeting().capitalize() + ', ' + greetingQuestions.getRandomOne() + '?');

		addTextEntryInput('customer-mood', '~');
		addTextEntrySubmit('customer-mood-submit');

		setTextEntriesEvents('customer-mood', 'customer-mood-submit', function(){ 
			askForName.call(); 	
		});

		openEntrySpeech(getTimeout(2));	
	}

	
	// TODO: request the customer's name
	var askForName = function() {
		var positiveFeedbacks = [ 'está bem', 'bem'];
		var inspectionIntent = [ 'vamos agendar sua inspeção', 'vamos começar a agendar a inspeção'];
		var nameRequests = [ 'qual é o seu nome', 'como você se chama'];

		updateAgentSpeech( '' + positiveFeedbacks.getRandomOne().capitalize() + ', ' + inspectionIntent.getRandomOne() + '.');
		updateAgentSpeech( '' + nameRequests.getRandomOne().capitalize() + '?', getTimeout(3));
		
		addTextEntryInput('customer-name', '~', "/^(\\s?[a-záâãàçéêíóôõú]{2,26}\\s?)+$/i");
		addTextEntrySubmit('customer-name-submit');

		setTextEntriesEvents('customer-name', 'customer-name-submit', function(){
			ic_sellers_register_model.vehicle.seller.name = $('[name="customer-name"]').val();
			askForEmail.call();
		});

		openEntrySpeech(getTimeout(2));
	}

	// TODO: request the customer's email 
	var askForEmail = function() {
		var emailRequests = ['qual é o seu email'];

		updateAgentSpeech( '' + emailRequests.getRandomOne().capitalize() + '?');

		addTextEntryInput('customer-email', '~', "/^[a-z0-9!#$%&'*+/=?^_`{|}~.-]+@[a-z0-9-]+(\\.[a-z0-9-]+)*$/");
		addTextEntrySubmit('customer-email-submit');

		setTextEntriesEvents('customer-email', 'customer-email-submit', function(){
			ic_sellers_register_model.vehicle.seller.email = $('[name="customer-email"]').val();
			askForTelephone.call();
		});

		openEntrySpeech(getTimeout(2));
	}

	// TODO: request the customer's telephone 
	var askForTelephone = function() {
		var telephoneRequests = ['qual é o seu telefone', 'e seu número de telefone']; 

		updateAgentSpeech( '' + telephoneRequests.getRandomOne().capitalize() + '?');

		addTextEntryInput('customer-telephone', '+55 (11) 95325-5163', "/^(\\+55)?(-|\\s)?\\(?11\\)?(-|\\s)?[0-9]{4,5}(-|\\s)?[0-9]{4}$/");
		addTextEntrySubmit('customer-telephone-submit');

		setTextEntriesEvents('customer-telephone', 'customer-telephone-submit', function(){
			ic_sellers_register_model.vehicle.seller.telephone = $('[name="customer-telephone"]').val();
			askForAddress.call();
		});

		openEntrySpeech(getTimeout(1));
	}

	// TODO: request the customer's address
	var askForAddress = function() {
		var addressRequests = ['onde você mora', 'qual é o seu endereço']; 

		updateAgentSpeech( '' + addressRequests.getRandomOne().capitalize() + '?');

		addTextEntryInput('customer-address', 'Endereço | Código Postal | Número | Complemento');
		addTextEntrySubmit('customer-address-submit');

		setTextEntriesEvents('customer-address', 'customer-address-submit', function(){
			var homeInfo = $('[name="customer-address"]').val().split('|');
			if (homeInfo.length > 0) ic_sellers_register_model.vehicle.seller.homeInfo.address = homeInfo[0].trim();
			if (homeInfo.length > 1) ic_sellers_register_model.vehicle.seller.homeInfo.zipcode = homeInfo[1].trim();
			if (homeInfo.length > 2) ic_sellers_register_model.vehicle.seller.homeInfo.number = homeInfo[2].trim();
			if (homeInfo.length > 3) ic_sellers_register_model.vehicle.seller.homeInfo.complement = homeInfo[3].trim();
			askForCarBrand.call();
		});

		openEntrySpeech(getTimeout(1));
	}

	// TODO: request the car's brand
	var askForCarBrand = function() {
		var makeRequests = ['escolha a marca do seu veículo', 'selecione o fabricante do seu veículo'];

		updateAgentSpeech('' + makeRequests.getRandomOne().capitalize() + ':');

		addOptionEntrySelect('customer-carmaker', 'Marca do Carro');
		addTextEntrySubmit('customer-carmaker-submit');

		$.get(location + '/sellers/v2/search/makes')
		.done(function(data) {
			cars = Array.from(new Set(data)).sort();
			for (var i in cars) {
				if(typeof(cars[i]) !== 'string')
					continue;
				var _option = $('<option></option>').val(cars[i]).text(cars[i]);
				$('[name="customer-carmaker"]').append(_option);
			};
		})
		.always(function() {
			$('[name="customer-carmaker"]').val('');
		});

		setTextEntriesEvents('customer-carmaker', 'customer-carmaker-submit', function(){
			ic_sellers_register_model.vehicle.make = $('[name="customer-carmaker"]').val();
			askForCarModel.call();
		});

		openEntrySpeech(getTimeout(2));
	}

	// TODO: request the car's model
	var askForCarModel = function() {
		var modelRequests = ['indique o modelo do seu carro', 'escolha o modelo do seu carro'];

		updateAgentSpeech('' + modelRequests.getRandomOne().capitalize() + ':');

		addOptionEntrySelect('customer-carmodel', 'Modelo do Carro');
		addTextEntrySubmit('customer-carmodel-submit');

		$.get(location + '/sellers/v2/search/models?make=' + ic_sellers_register_model.vehicle.make)
		.done(function(data) {
			models = Array.from(new Set(data)).sort();
			for (var i in models) {
				if(typeof(cars[i]) !== 'string')
					continue;
				var _option = $('<option></option>').val(models[i]).text(models[i]);
				$('[name="customer-carmodel"]').append(_option);
			};
		}).always(function(){
			$('[name="customer-carmodel"]').val('');
		});

		setTextEntriesEvents('customer-carmodel', 'customer-carmodel-submit', function(){
			ic_sellers_register_model.vehicle.model = $('[name="customer-carmodel"]').val();
			askForCarYear.call();
		});

		openEntrySpeech(getTimeout(2));
	}

	// TODO: request the car's year
	var askForCarYear = function() {
		var yearRequests = ['indique o ano da fabricação do seu carro', 'escolha o ano da fabricação do seu carro'];

		updateAgentSpeech('' + yearRequests.getRandomOne().capitalize() + ':');

		addOptionEntrySelect('customer-caryear', 'Ano da Fabricação');
		addTextEntrySubmit('customer-caryear-submit');

		$.get(location + '/sellers/v2/search/years?make=' + ic_sellers_register_model.vehicle.make + '&model=' + ic_sellers_register_model.vehicle.model)
		.done(function(data) {
			years = Array.from(new Set(data)).sort().reverse();
			for (var i in years) {
				if(typeof(cars[i]) !== 'string')
					continue;
				var _option = $('<option></option>').val(years[i]).text(years[i]);
				$('[name="customer-caryear"]').append(_option);
			};
		}).always(function(){
			$('[name="customer-caryear"]').val('');
		});

		setTextEntriesEvents('customer-caryear', 'customer-caryear-submit', function(){
			ic_sellers_register_model.vehicle.year = $('[name="customer-caryear"]').val();
			askForCarVersion.call();
		});

		openEntrySpeech(getTimeout(2));
	}

	// TODO: request the car's specifications/slug
	var askForCarVersion = function() {
		var versionRequests = ['indique a versão do seu carro', 'escolha a versão do seu carro'];

		updateAgentSpeech('' + versionRequests.getRandomOne().capitalize() + ':');

		addOptionEntrySelect('customer-carslug', 'Versão');
		addTextEntrySubmit('customer-carslug-submit');

		$.get(location + '/sellers/v2/search/specifications?make=' + ic_sellers_register_model.vehicle.make + '&model=' + ic_sellers_register_model.vehicle.model + '&year=' + ic_sellers_register_model.vehicle.year)
		.done(function(data) {
			specs = Array.from(new Set(data)).sort();
			for (var i in specs) {
				if(typeof(cars[i]) !== 'string')
					continue;
				var _option = $('<option></option>').val(specs[i].slug).attr('id', specs[i]._id).text(specs[i].slug);
				$('[name="customer-carslug"]').append(_option);
			};
		}).always(function(){
			$('[name="customer-carslug"]').val('');
		});

		setTextEntriesEvents('customer-carslug', 'customer-carslug-submit', function(){
			ic_sellers_register_model.vehicle.slug = $('[name="customer-carslug"]').val();
			ic_sellers_register_model.vehicle.car = $('[name="customer-carslug"]').find(':selected').attr('id');
			askForInspectionVenue.call();
		});

		openEntrySpeech(getTimeout(2));
	}

	// TODO: request the inspection venue
	var askForInspectionVenue = function() {
		var venueRequests = ['seleções onde deseja realizar a inspeção', 'diga-me em qual localidade você deseja fazer a inspeção'];

		updateAgentSpeech('' + venueRequests.getRandomOne().capitalize() + ':');

		addOptionEntrySelect('customer-inspectionvenue', 'Local');
		addTextEntrySubmit('customer-inspectionvenue-submit');

		$.get(location + '/sellers/v2/venues')
		.done(function(data) {
			venues = Array.from(new Set(data)).sort((a, b) => {
				var x1 = a.name.toLowerCase();
				var x2 = b.name.toLowerCase();
				if (x1 > x2)
					return 1;
				if (x1 === x2)
					return 0;
				if (x1 < x2)
					return -1; 
			});
			for (var i in venues) {
				if ( (searchParams.get('allVenues') || venues[i].isEnabled) && !venues[i].isDeleted ) 
				{
					var _option = $('<option></option>').val(venues[i].name).attr('id', venues[i]._id).text(venues[i].name);
					$('[name="customer-inspectionvenue"]').append(_option);
				}
			};
		}).always(function(){
			$('[name="customer-inspectionvenue"]').val('');
		});

		setTextEntriesEvents('customer-inspectionvenue', 'customer-inspectionvenue-submit', function(){
			ic_sellers_register_model.inspection.location = $('[name="customer-inspectionvenue"]').find(':selected').attr('id');
			askForInspectionDay.call();
		});

		openEntrySpeech(getTimeout(3));
	}

	// TODO: request the inspection day
	var askForInspectionDay = function() {
		var dayRequests = ['escolha o dia da sua inspeção', 'selecione o dia'];

		updateAgentSpeech('' + dayRequests.getRandomOne().capitalize() + ':');

		addOptionEntrySelect('customer-inspectionday', 'Dia');
		addTextEntrySubmit('customer-inspectionday-submit');

		var now = new Date();
		var today = now.format('m/d/yyyy');
		var currentTime = now.getTime();

		$.get(location + '/sellers/v2/venues/' + ic_sellers_register_model.inspection.location 
			+ '/slots?slug=' + ic_sellers_register_model.vehicle.slug 
			+ '&startDate=' + now.format('mm/dd/yyyy') 
			+ '&endDate=' + now.addDays(7).format('mm/dd/yyyy'))
		.done(function(data) {
			for (var i = 0; i < 7; i++) {
				var date = now.addDays(i);
				var iDay = date.format('m/d/yyyy');

				if ( data !== undefined && data[iDay] !== undefined && data[iDay].length > 0 ) {
					var slots = data[iDay];
					var last = slots.length - 1;
					var isAvailable = (slots[last]['maxSlots'] > slots[last]['totalUsed']);

					if ( isAvailable && today === iDay && currentTime > slots[last]['startTime'] )
						continue;
					
					var iDayName = daysOfTheWeek[ date.format('dddd').toLowerCase() ].capitalize();
					var _option = $('<option></option>').val( iDayName ).attr('slotDay', iDay).text( iDayName );
					$('[name="customer-inspectionday"]').append(_option);
				}
			}
		}).always(function(){
			$('[name="customer-inspectionday"]').val('');
		});

		setTextEntriesEvents('customer-inspectionday', 'customer-inspectionday-submit', function(){
			ic_sellers_register_model.inspection.appointment.dateStart = $('[name="customer-inspectionday"]').find(':selected').attr('slotDay');
			askForInspectionTime.call();
		});

		openEntrySpeech(getTimeout(2));
	}

	// TODO: request the inspection time
	var askForInspectionTime = function() {
		var timeRequests = ['escolha o tempo da sua inspeção', 'selecione o tempo'];

		updateAgentSpeech('' + timeRequests.getRandomOne().capitalize() + ':');

		addOptionEntrySelect('customer-inspectiontime', 'Hora');
		addTextEntrySubmit('customer-inspectiontime-submit');

		var selectedDate = new Date(ic_sellers_register_model.inspection.appointment.dateStart);
		var selectedDay = selectedDate.format('m/d/yyyy');
		var now = new Date();
		var today = now.format('m/d/yyyy');
		var currentTime = now.getTime();

		$.get(location + '/sellers/v2/venues/' + ic_sellers_register_model.inspection.location 
			+ '/slots?slug=' + ic_sellers_register_model.vehicle.slug 
			+ '&startDate=' + selectedDate.format('mm/dd/yyyy') 
			+ '&endDate=' + selectedDate.addDays(1).format('mm/dd/yyyy'))
		.done(function(data) {
			if ( data !== undefined && data[selectedDay].length > 0 ) {
				var slots = data[selectedDay];
				var last = slots.length - 1;
				for (var i = 0; i < last; i++) {
					var isAvailable = (slots[i]['maxSlots'] > slots[i]['totalUsed']);

					if ( isAvailable && today === selectedDay && currentTime > slots[i]['startTime'] )
						continue;
					
					var startTime = new Date(slots[i]['startTime']);
					var endTime = new Date(slots[i]['endTime']);
					var dateStart = startTime.format('yyyy-mm-dd"T"HH:MM:ss.sss"Z"'); //isoUtcDateTime
					var dateFinish = endTime.format('yyyy-mm-dd"T"HH:MM:ss.sss"Z"'); //isoUtcDateTime
					var text = startTime.format('HH:MM') + ' - ' + endTime.format('HH:MM');
					
					var _option = $('<option></option>').val( text ).attr('dateStart', dateStart).attr('dateFinish', dateFinish).text( text );
					$('[name="customer-inspectiontime"]').append(_option);
				}
			}
		}).always(function(){
			$('[name="customer-inspectiontime"]').val('');
		});

		setTextEntriesEvents('customer-inspectiontime', 'customer-inspectiontime-submit', function(){
			ic_sellers_register_model.inspection.appointment.dateStart = $('[name="customer-inspectiontime"]').find(':selected').attr('dateStart');
			ic_sellers_register_model.inspection.appointment.dateFinish = $('[name="customer-inspectiontime"]').find(':selected').attr('dateFinish');
			estimateTheCarPrice.call();
		});

		openEntrySpeech(getTimeout(1));
	}

	// TODO: tell the price of the car by the slug
	var estimateTheCarPrice = function() {
		updateAgentSpeech('Cálculo do preço...', getTimeout(2));

		$.get(location + '/sellers/v2/price?slug=' + ic_sellers_register_model.vehicle.slug 
			+ '&isArmored=false')
		.done(function(data) {
			updateAgentSpeech('Estimamos conseguir propostas entre ' + data.minPrice.toLocaleString(locale, currency)
				+ ' a ' + data.maxPrice.toLocaleString(locale, currency) 
				+ ' para o seu veículo.',
				getTimeout(6)
			);
			createLeads.call();
		});
	}

	// TODO: create a lead
	var createLeads = function() {

		$.post(location + '/sellers/v2/leads', {
			"status": "WAITING_FOR_PRICE",
			"make": ic_sellers_register_model.vehicle.make,
			"model": ic_sellers_register_model.vehicle.model,
			"year": ic_sellers_register_model.vehicle.year,
			"slug": ic_sellers_register_model.vehicle.slug,
			"name": ic_sellers_register_model.vehicle.seller.name,
			"email": ic_sellers_register_model.vehicle.seller.email,
			"phone": ic_sellers_register_model.vehicle.seller.telephone,
			"utm": referer.utm,
			"googleAnalyticsId": null,
			"mixpanelDistinctId": null
		})
		.done(function(data) 
		{
			console.log(data);
			createAppointment.call();
		})
		.fail(function(err)
		{
			// TODO: send the question to support e-mail
			answer = 'Detetei um problema de rede, tente novamente novamente depois de atualizar esta página.';
			updateAgentSpeech(answer, getTimeout(3));
			console.log(err);
		})
		.always(function()
		{
			console.log('Leads creation ended.');
		});
	}

	// TODO: create the appointment
	var createAppointment = function() {
		updateAgentSpeech('Confirmação da inspeção...', getTimeout(6));

		$.post(location + '/sellers/v2/register', ic_sellers_register_model)
		.done(function(data) 
		{
			updateAgentSpeech('Parabéns, a sua inspeção foi agendada!', getTimeout(3));
			console.log(data);
		})
		.fail(function(err)
		{
			// TODO: send the question to support e-mail
			answer = 'Detetei um problema de rede, tente novamente novamente depois de atualizar esta página.';
			updateAgentSpeech(answer, getTimeout(3));
			console.log(err);
		})
		.always(function()
		{
			console.log('Inspection creation ended.');
		});
	}

	greetCustomer();
});

/*
<video width="560" height="315" controls webkitallowfullscreen mozallowfullscreen allowfullscreen>
  <source src="https://player.vimeo.com/video/209741564" type="video/mp4">
  <!-- this is a playlist, you can list many others -->
</video>

<iframe src="https://player.vimeo.com/video/209741564" width="640" height="360" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>

Enviar Mensagem:
Nome
Telefone
Endereço
E-mail
Escreva aqui a sua mensagem

*/