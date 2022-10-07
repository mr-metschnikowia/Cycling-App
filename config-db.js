(function() {
	const db_info = {url:'localhost',
                        username: 'webuser',
                        password: 'mongod',
                        port: '23257',
						database: 'cycle_app',
                        collection: 'users'};

	const moduleExports = db_info;

    if (typeof __dirname != 'undefined')
        module.exports = moduleExports;
}());