﻿angular.module('virtoCommerce.contentModule')
.factory('virtoCommerce.contentModule.menus', ['$resource', function ($resource) {
    return $resource('api/cms/:storeId/menu/', {}, {
        get: { url: 'api/cms/:storeId/menu/', method: 'GET', isArray: true },
        getList: { url: 'api/cms/:storeId/menu/:listId', method: 'GET' },
        checkList: { url: 'api/cms/:storeId/menu/checkname', method: 'GET' },
        update: { url: 'api/cms/:storeId/menu/', method: 'POST' },
        delete: { url: 'api/cms/:storeId/menu/', method: 'DELETE' }
    });
}])
.factory('virtoCommerce.contentModule.pages', ['$resource', function ($resource) {
    return $resource('api/cms/:storeId/pages/', {}, {
        //checkName: { url: 'api/cms/:storeId/pages/checkname', method: 'GET' },

        //createBlog: { url: 'api/cms/:storeId/pages/blog/:blogName', method: 'POST' },
        //updateBlog: { url: 'api/cms/:storeId/pages/blog/:blogName/:oldBlogName', method: 'POST' },
    });
}])
.factory('virtoCommerce.contentModule.themes', ['$resource', function ($resource) {
    return $resource(null, null, {
        createTheme: { url: 'api/content/themes/:storeId/createTheme', method: 'POST' },
        copyDefaultTheme: { url: 'api/content/copy' },
        cloneTheme: { url: 'api/content/themes/:storeId/cloneTheme', method: 'POST' }
    });
}])
.factory('virtoCommerce.contentModule.contentApi', ['$resource', function ($resource) {
    return $resource('api/content/:contentType/:storeId', null, {
        get: {
            // using transformResponse to:
            // 1. avoid automatic response result string converting to array;
            transformResponse: function (rawData) { return { data: rawData }; }
        },
        // post data as multipart form
        save: {
            method: 'POST',
            headers: { 'Content-Type': undefined },
            transformRequest: function (currentEntity) {
                var fd = new FormData();
                fd.append(currentEntity.name, currentEntity.content);
                return fd;
            },
            isArray: true
        },
        getWithMetadata: {
            // using transformResponse to:
            // 1. avoid automatic response result string converting to array;
            // 2. parse metadata as needed.
            transformResponse: function (rawData) {
                var retVal = {};
                var parts = rawData.split('---');
                if (parts.length > 2) { // parts[0] is left empty
                    retVal.content = parts[2].trim();
                    var parsedMetadata = [];
                    var parsedYAML = YAML.parse(parts[1].trim());
                    retVal.metadata = _.map(parsedYAML, function (val, key) {
                        return { name: key, values: _.map(val.split(','), function (v) { return { value: v }; }) };
                    });
                }
                else {
                    retVal.content = rawData;
                }
                return retVal;
            }
        },
        // post data as multipart form
        saveWithMetadata: {
            method: 'POST',
            headers: { 'Content-Type': undefined },
            transformRequest: function (currentEntity) {
                var metadata = {};
                var nonEmptyProperties = _.filter(currentEntity.dynamicProperties, function (x) { return _.any(x.values) && x.values[0].value; });
                _.each(nonEmptyProperties, function (x) {
                    metadata[x.name] = _.pluck(x.values, 'value').join();
                });
                var dataToSave = '---\n' + YAML.stringify(metadata) + '\n---\n' + (currentEntity.content || '').trim();

                var blobName = currentEntity.name;
                var blobNameExtension = '.md';
                var idx = blobName.lastIndexOf('.');
                if (idx >= 0) {
                    blobNameExtension = blobName.substring(idx);
                    blobName = blobName.substring(0, idx);
                    idx = blobName.lastIndexOf('.'); // language
                    if (idx >= 0) {
                        blobName = blobName.substring(0, idx); // cut language from name
                    }
                }

                if (currentEntity.language) {
                    blobName += '.' + currentEntity.language;
                }

                var fd = new FormData();
                fd.append(blobName + blobNameExtension, dataToSave);
                return fd;
            },
            isArray: true
        },
        createFolder: { url: 'api/content/themes/:storeId/folder', method: 'POST' },
        move: { url: 'api/content/themes/:storeId/move' }
    });
}])
.factory('virtoCommerce.contentModule.stores', ['$resource', function ($resource) {
    return $resource('api/stores', {}, {
        get: { url: 'api/stores/:id' },
        update: { method: 'PUT' }
    });
}]);