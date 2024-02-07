import type { Literal, BaseNode, Property, Identifier, CallExpression, AssignmentExpression, MemberExpression, MethodDefinition, ExportSpecifier } from 'estree';
import { Node, ElementNode, DirectiveNode, SimpleExpressionNode, AttributeNode } from '@vue/compiler-core';
export declare const isProperty: (node: BaseNode) => node is Property;
export declare const isIdentifier: (node: BaseNode) => node is Identifier;
export declare const isAssignmentExpression: (node: BaseNode) => node is AssignmentExpression;
export declare const isCallExpression: (node: BaseNode) => node is CallExpression;
export declare const isMemberExpression: (node: BaseNode) => node is MemberExpression;
export declare const isMethodDefinition: (node: BaseNode) => node is MethodDefinition;
export declare const isExportSpecifier: (node: BaseNode) => node is ExportSpecifier;
export declare const isReference: (node: BaseNode, parent: BaseNode) => boolean;
export declare function createLiteral(value: string): Literal;
export declare function createIdentifier(name: string): Identifier;
export declare function createCallExpression(callee: unknown, args: unknown[]): CallExpression;
export declare function parseVue(code: string, errors: SyntaxError[]): import("@vue/compiler-core").RootNode;
export declare function isElementNode(node: Node): node is ElementNode;
export declare function isAttributeNode(node: Node): node is AttributeNode;
export declare function isDirectiveNode(node: Node): node is DirectiveNode;
export declare function isSimpleExpressionNode(node: Node): node is SimpleExpressionNode;
//# sourceMappingURL=ast.d.ts.map