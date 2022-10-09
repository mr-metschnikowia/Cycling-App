(function() {
	const db_info = {url:'XXX',
                        username: 'XXX',
                        password: 'XXX',
                        port: 'XXX',
			database: 'XXX',
                        collection: 'users'};

	const moduleExports = db_info;

    if (typeof __dirname != 'undefined')
        module.exports = moduleExports;
}());
