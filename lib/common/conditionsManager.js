'use strict';

const Relation = {
    IS: "is",
    IS_NOT: "is not",
    LESS_THAN: "less than",
    GREATER_THAN: "greater than",
    LESS_THAN_EQUAL_TO: "less than or equal to",
    GREATER_THAN_EQUAL_TO: "greater than or equal to"
};

const conditions = [
    {
        id: "usergroup",
        name: "User's Viewer Group",
        relations: [Relation.IS, Relation.IS_NOT]
    }
];

exports.ConditionRelation = Relation;
exports.conditions = conditions;