describe('XMLRPC', function() {
	var methodName = "test";
	var basicXMLString 	= "<methodCall><methodName>test</methodName><params><param><value><int>1</int></value></param><param><value><string>petr</string></value></param><param><value><boolean>1</boolean></value></param></params></methodCall>";
	var objectXMLString = "<methodCall><methodName>test</methodName><params><param><value><array><data><value><int>1</int></value><value><int>2</int></value><value><int>3</int></value></data></array></value></param><param><value><struct><member><name>a</name><value><int>1</int></value></member><member><name>b</name><value><int>2</int></value></member></struct></value></param><param><value><dateTime.iso8601>2015-06-30T10:18:38.842Z</dateTime.iso8601></value></param></params></methodCall>";
	var hintsXMLString 	= "<methodCall><methodName>test</methodName><params><param><value><double>1.234</double></value></param><param><value><struct><member><name>a</name><value><string>petr</string></value></member><member><name>b</name><value><double>724.6</double></value></member></struct></value></param><param><value><base64><value>AA==</value></base64></value></param></params></methodCall>"
    
	var basicData 	=  [1,"petr",true];
	var objectData 	= [[1,2,3],{"a":1,"b":2}, new Date(1435659518842)];
	
	var toBinary = "petr";
	var binary 	 = JAK.Base64.atob("petr");
	var hintsData = [1.234, {"a":"petr", "b":724.6},binary];
	
	describe('serialization', function() {
		it('should serialize basic data', function() {
			var test = JAK.XMLRPC.serializeCall(methodName,basicData);
			expect(test).toEqual(basicXMLString);
		});
		
		it('should serialization objects (struct, array,date)', function() {
			var test = JAK.XMLRPC.serializeCall(methodName,objectData)
			expect(test).toEqual(objectXMLString);
		});
		
		it('should serialization data with hints', function() {
			var hints = {
				"0":"float",
				"1.b":"float",
				"2":"binary"
			};
			var test = JAK.XMLRPC.serializeCall(methodName,hintsData,hints);
			expect(test).toEqual(hintsXMLString);
		});
		
	});
	describe('parsing', function() {
		it('should parse XML respponse', function() {
			var testJSON = '{"grid":{"bbox":[1557000,6445200,1560000,6447600],"gridSize":600},"poi":[{"geomInLookup":false,"id":1892725,"imgPath":"/basepoifrpc","mark":{"lat":49.999783906,"lon":13.9997804908},"source":"base","title":"Zámek Nižbor","typeId":1229,"zoom":13,"zoomMax":0},{"geomInLookup":false,"id":352793,"imgPath":"/firmpoifrpc","mark":{"lat":49.99990463256836,"lon":14.00207805633545},"source":"firm","title":"Nižbor - obecní úřad","typeId":5118,"zoom":13,"zoomMax":20},{"geomInLookup":false,"id":165245,"imgPath":"/firmpoifrpc","mark":{"lat":50.0003547668457,"lon":14.002864837646484},"source":"firm","title":"BENOL, s.r.o.","typeId":5313,"zoom":13,"zoomMax":20},{"geomInLookup":false,"id":216858,"imgPath":"/firmpoifrpc","mark":{"lat":49.999935150146484,"lon":14.00295352935791},"source":"firm","title":"Česká pošta, s.p.","typeId":5114,"zoom":13,"zoomMax":20},{"geomInLookup":false,"id":15212259,"imgPath":"/jrpoifrpc","mark":{"lat":50.0033619512,"lon":13.9983344913},"source":"pubt","title":"Nižbor","typeId":6512,"zoom":13,"zoomMax":0},{"geomInLookup":false,"id":15262693,"imgPath":"/jrpoifrpc","mark":{"lat":50.0026530334285,"lon":14.0027787442817},"source":"pubt","title":"Nižbor, odb.žel.st.","typeId":6507,"zoom":13,"zoomMax":14}],"status":200,"statusMessage":"OK"}';
			var xmlStr = '<methodResponse><params><param><value><struct><member><name>grid</name><value><struct><member><name>bbox</name><value><array><data><value><double>1557000</double></value><value><double>6445200</double></value><value><double>1560000</double></value><value><double>6447600</double></value></data></array></value></member><member><name>gridSize</name><value><double>600</double></value></member></struct></value></member><member><name>poi</name><value><array><data><value><struct><member><name>geomInLookup</name><value><boolean>0</boolean></value></member><member><name>id</name><value><i4>1892725</i4></value></member><member><name>imgPath</name><value><string>/basepoifrpc</string></value></member><member><name>mark</name><value><struct><member><name>lat</name><value><double>49.999783905999998</double></value></member><member><name>lon</name><value><double>13.999780490799999</double></value></member></struct></value></member><member><name>source</name><value><string>base</string></value></member><member><name>title</name><value><string>Zámek Nižbor</string></value></member><member><name>typeId</name><value><i4>1229</i4></value></member><member><name>zoom</name><value><i4>13</i4></value></member><member><name>zoomMax</name><value><i4>0</i4></value></member></struct></value><value><struct><member><name>geomInLookup</name><value><boolean>0</boolean></value></member><member><name>id</name><value><i4>352793</i4></value></member><member><name>imgPath</name><value><string>/firmpoifrpc</string></value></member><member><name>mark</name><value><struct><member><name>lat</name><value><double>49.999904632568359</double></value></member><member><name>lon</name><value><double>14.002078056335449</double></value></member></struct></value></member><member><name>source</name><value><string>firm</string></value></member><member><name>title</name><value><string>Nižbor - obecní úřad</string></value></member><member><name>typeId</name><value><i4>5118</i4></value></member><member><name>zoom</name><value><i4>13</i4></value></member><member><name>zoomMax</name><value><i4>20</i4></value></member></struct></value><value><struct><member><name>geomInLookup</name><value><boolean>0</boolean></value></member><member><name>id</name><value><i4>165245</i4></value></member><member><name>imgPath</name><value><string>/firmpoifrpc</string></value></member><member><name>mark</name><value><struct><member><name>lat</name><value><double>50.000354766845703</double></value></member><member><name>lon</name><value><double>14.002864837646484</double></value></member></struct></value></member><member><name>source</name><value><string>firm</string></value></member><member><name>title</name><value><string>BENOL, s.r.o.</string></value></member><member><name>typeId</name><value><i4>5313</i4></value></member><member><name>zoom</name><value><i4>13</i4></value></member><member><name>zoomMax</name><value><i4>20</i4></value></member></struct></value><value><struct><member><name>geomInLookup</name><value><boolean>0</boolean></value></member><member><name>id</name><value><i4>216858</i4></value></member><member><name>imgPath</name><value><string>/firmpoifrpc</string></value></member><member><name>mark</name><value><struct><member><name>lat</name><value><double>49.999935150146484</double></value></member><member><name>lon</name><value><double>14.00295352935791</double></value></member></struct></value></member><member><name>source</name><value><string>firm</string></value></member><member><name>title</name><value><string>Česká pošta, s.p.</string></value></member><member><name>typeId</name><value><i4>5114</i4></value></member><member><name>zoom</name><value><i4>13</i4></value></member><member><name>zoomMax</name><value><i4>20</i4></value></member></struct></value><value><struct><member><name>geomInLookup</name><value><boolean>0</boolean></value></member><member><name>id</name><value><i4>15212259</i4></value></member><member><name>imgPath</name><value><string>/jrpoifrpc</string></value></member><member><name>mark</name><value><struct><member><name>lat</name><value><double>50.003361951199999</double></value></member><member><name>lon</name><value><double>13.9983344913</double></value></member></struct></value></member><member><name>source</name><value><string>pubt</string></value></member><member><name>title</name><value><string>Nižbor</string></value></member><member><name>typeId</name><value><i4>6512</i4></value></member><member><name>zoom</name><value><i4>13</i4></value></member><member><name>zoomMax</name><value><i4>0</i4></value></member></struct></value><value><struct><member><name>geomInLookup</name><value><boolean>0</boolean></value></member><member><name>id</name><value><i4>15262693</i4></value></member><member><name>imgPath</name><value><string>/jrpoifrpc</string></value></member><member><name>mark</name><value><struct><member><name>lat</name><value><double>50.002653033428501</double></value></member><member><name>lon</name><value><double>14.0027787442817</double></value></member></struct></value></member><member><name>source</name><value><string>pubt</string></value></member><member><name>title</name><value><string>Nižbor, odb.žel.st.</string></value></member><member><name>typeId</name><value><i4>6507</i4></value></member><member><name>zoom</name><value><i4>13</i4></value></member><member><name>zoomMax</name><value><i4>14</i4></value></member></struct></value></data></array></value></member><member><name>status</name><value><i4>200</i4></value></member><member><name>statusMessage</name><value><string>OK</string></value></member></struct></value></param></params></methodResponse>';
			var doc = JAK.XML.createDocument(xmlStr);
			var out = JAK.XMLRPC.parse(doc.getElementsByTagName('param')[0].getElementsByTagName('value')[0]);
			var outStr = JSON.stringify(out);
			expect(outStr).toEqual(testJSON);
		});
		
	});
});
