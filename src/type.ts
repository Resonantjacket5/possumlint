import * as ast from './ast'
import { CallExp } from './ast';

// type rule = {
//   [symbol:string]:{

//   }
// }

class TypeChecker {
  //private scope:Array<ast.Lode> = [] 
  constructor(
    private rootNode:ast.Lode,
    private rules:Array<any>,
  ) {
    this.rules = [
      {
        "CallExp":{
          "body":[
            {
              
            }
          ],
          "scope":0
        }
      }
    ]
  }

  traverse(node:ast.Lode, scope:Array<ast.Lode>) {
    scope.push(node)
    this.nodecheck(node, scope)
    for (let child of node.children()) {
      this.traverse(child, scope)
    }
  }

  nodecheck(node:ast.Lode, scope:Array<ast.Lode>) {
    if (node instanceof ast.CallExp) {
      if (node.callee instanceof ast.ID) {
        if (node.callee.text == 'pipeline') {
          let temp = []
          for (let stmt of node.stmts) {
            let callExp = stmt as CallExp
            // temp.push(callExp.callee.text)
          }
        }
      }
    }
  }


}