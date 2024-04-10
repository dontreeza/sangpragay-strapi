"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[3848],{1086:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>c,contentTitle:()=>a,default:()=>u,frontMatter:()=>i,metadata:()=>r,toc:()=>d});var o=t(4848),s=t(8453);const i={title:"unstable_useDocument",description:"API reference for the useDocument hook",tags:["admin","hooks","document","validations"]},a=void 0,r={id:"docs/core/admin/features/hooks/use-document",title:"unstable_useDocument",description:"API reference for the useDocument hook",source:"@site/docs/docs/01-core/admin/05-features/hooks/use-document.mdx",sourceDirName:"docs/01-core/admin/05-features/hooks",slug:"/docs/core/admin/features/hooks/use-document",permalink:"/docs/core/admin/features/hooks/use-document",draft:!1,unlisted:!1,editUrl:"https://github.com/strapi/strapi/tree/main/docs/docs/docs/01-core/admin/05-features/hooks/use-document.mdx",tags:[{label:"admin",permalink:"/tags/admin"},{label:"hooks",permalink:"/tags/hooks"},{label:"document",permalink:"/tags/document"},{label:"validations",permalink:"/tags/validations"}],version:"current",frontMatter:{title:"unstable_useDocument",description:"API reference for the useDocument hook",tags:["admin","hooks","document","validations"]},sidebar:"docs",previous:{title:"useAdminRoles",permalink:"/docs/core/admin/features/hooks/use-admin-roles"},next:{title:"useEnterprise",permalink:"/docs/core/admin/features/hooks/use-enterprise"}},c={},d=[{value:"Usage",id:"usage",level:2},{value:"<code>validate()</code>",id:"validate",level:3}];function l(e){const n={admonition:"admonition",code:"code",h2:"h2",h3:"h3",li:"li",ol:"ol",p:"p",pre:"pre",strong:"strong",...(0,s.R)(),...e.components};return(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)(n.admonition,{type:"caution",children:(0,o.jsxs)(n.p,{children:["This hook is not stable and ",(0,o.jsx)(n.strong,{children:"likely to change"}),". Use at your own risk."]})}),"\n",(0,o.jsx)(n.p,{children:"A hook that returns utilities to work with documents."}),"\n",(0,o.jsx)(n.h2,{id:"usage",children:"Usage"}),"\n",(0,o.jsx)(n.pre,{children:(0,o.jsx)(n.code,{children:"function Component() {\n  const { validate } = unstable_useDocument();\n}\n"})}),"\n",(0,o.jsx)(n.p,{children:"At the moment, useDocument only returns a validate function."}),"\n",(0,o.jsx)(n.h3,{id:"validate",children:(0,o.jsx)(n.code,{children:"validate()"})}),"\n",(0,o.jsx)(n.pre,{children:(0,o.jsx)(n.code,{className:"language-ts",children:"const validate(\n  entry: Entity,\n  {\n    contentType: Schema.ContentType,\n    components: {\n      [key: Schema.Component['uid']]: Schema.Component;\n    },\n    isCreatingEntry?: boolean;\n  }\n): {\n  errors: { [key: string]: TranslationMessage }\n}\n"})}),"\n",(0,o.jsx)(n.p,{children:"With this function, you can apply the same validations we use in the admin. Please be aware that for this function to work, you need to ensure the following:"}),"\n",(0,o.jsxs)(n.ol,{children:["\n",(0,o.jsxs)(n.li,{children:["If you are validating an entry with relations/components/dynamic zones then it ",(0,o.jsx)(n.strong,{children:"MUST"})," be populated. Otherwise, the validations will pass even if there is an error on one populated field."]}),"\n",(0,o.jsx)(n.li,{children:"The correct schema for the contentType and the schemas for any components related to that content type are mandatory for this hook to function correctly."}),"\n"]})]})}function u(e={}){const{wrapper:n}={...(0,s.R)(),...e.components};return n?(0,o.jsx)(n,{...e,children:(0,o.jsx)(l,{...e})}):l(e)}},8453:(e,n,t)=>{t.d(n,{R:()=>a,x:()=>r});var o=t(6540);const s={},i=o.createContext(s);function a(e){const n=o.useContext(i);return o.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function r(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(s):e.components||s:a(e.components),o.createElement(i.Provider,{value:n},e.children)}}}]);