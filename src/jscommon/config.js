var Config = 
{
	'bundle_id' : 'com.yourcompany',
	'version' : '0.0.0',

	// Add more configuration values here
};


function getConfig(key, def)
{
	if(!(key in Config))
		return def;

	return Config[key];
}