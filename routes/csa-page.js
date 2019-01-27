exports.agendamento = function(req, res, next) 
{
	var template = require('jade').compileFile(__dirname + '/../source/templates/ic-sellers-agendamento.jade');

	try {
		if ( req.query['referralLink']!==undefined )
		{
			var request = require("request");
		    request({ 
	        	method: "HEAD", 
	        	url: req.query['referralLink'], 
	        	followAllRedirects: true 
	        },
	        function (error, response) {
		        if ( req.query['utm_source'] === undefined )
				{
					var reqURL = req.protocol + "://" + req.get('host') + req.originalUrl;
					res.redirect(reqURL + '&' + response.request.href.split('?')[1]);
				} 
				else
				{
		            var html = template();
		        	html = html.replace("#!@!#", response.request.href);
		            res.send(html);
		        }
		    });
		}
		else
		{
			var html = template();
	        res.send(html);
		}
	} catch (e) {
		next(e);
	}
}

exports.servico = function(req, res, next) 
{
	var template = require('jade').compileFile(__dirname + '/../source/templates/ic-sellers-servico.jade');

	try {
		var html = template();
		res.send(html);
	} catch (e) {
		next(e);
	}
}