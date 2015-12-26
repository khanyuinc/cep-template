var csInterface         = new CSInterface();
var imsInterface        = new IMSInterface();

function onLoad()
{
	var files = window['DYNAMIC_LOAD'] || [];

	for (var i=0; i < files.length; i++)
		JSX.loadJsx(files[i]);
	
	$('#version').text(getConfig('version'));	

	var isHosted = 'hostEnvironment' in csInterface;

	if (!isHosted)
		return;

	listenForThemeUpdates();
}