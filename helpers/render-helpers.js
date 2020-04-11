// import { response } from "express"

exports.renderTemplate = function (templatePath,context, response) {
    response.render(templatePath, context)
}

exports.isInArray = function(primaryArray, secondaryArray) {
    return secondaryArray.every(i => primaryArray.includes(i))
}