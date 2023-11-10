import { ParseResult } from '@babel/parser';
import { ObjectProperty, ObjectExpression, Expression, SpreadElement, ConditionalExpression, Identifier, NumericLiteral, StringLiteral, Literal } from '@babel/types';
import { ExpressionNode } from '@vue/compiler-core';
import { CodegenScope, CodegenVIfScope } from './options';
import { TransformContext } from './transform';
export declare function createIdentifier(name: string): Identifier;
export declare function createObjectProperty(name: string, value: Expression): ObjectProperty;
export declare function createSpreadElement(argument: ConditionalExpression): SpreadElement;
export declare function createObjectExpression(properties: Array<ObjectProperty | SpreadElement>): ObjectExpression;
export declare function createVIfProperty(condition: Expression, { id }: CodegenScope): ObjectProperty;
export declare function createVIfConditionalExpression({ condition, properties, }: CodegenVIfScope): ConditionalExpression;
export declare function createVIfSpreadElement(vIfScope: CodegenVIfScope): SpreadElement;
export declare function parseExpr(code: string | ExpressionNode, context: TransformContext, node?: ExpressionNode): ParseResult<Expression> | undefined;
export declare function parseParam(code: string, context: TransformContext, node: ExpressionNode): Identifier | import("@babel/types").RestElement | import("@babel/types").Pattern;
export declare function isUndefined(expr: Expression): boolean;
export declare function isTrueExpr(expr: Literal): boolean;
export declare function parseStringLiteral(expr: Expression | Identifier | StringLiteral | NumericLiteral): StringLiteral;
//# sourceMappingURL=ast.d.ts.map