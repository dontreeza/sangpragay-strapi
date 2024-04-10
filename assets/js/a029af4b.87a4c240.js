"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[4976],{6870:(e,s,i)=>{i.r(s),i.d(s,{assets:()=>d,contentTitle:()=>n,default:()=>w,frontMatter:()=>t,metadata:()=>l,toc:()=>a});var o=i(4848),r=i(8453);const t={title:"Review Workflows",description:"Review workflow technical design",tags:["review-workflows","implementation","tech design"]},n="Review Workflows",l={id:"docs/core/admin/ee/review-workflows",title:"Review Workflows",description:"Review workflow technical design",source:"@site/docs/docs/01-core/admin/01-ee/01-review-workflows.md",sourceDirName:"docs/01-core/admin/01-ee",slug:"/docs/core/admin/ee/review-workflows",permalink:"/docs/core/admin/ee/review-workflows",draft:!1,unlisted:!1,editUrl:"https://github.com/strapi/strapi/tree/main/docs/docs/docs/01-core/admin/01-ee/01-review-workflows.md",tags:[{label:"review-workflows",permalink:"/tags/review-workflows"},{label:"implementation",permalink:"/tags/implementation"},{label:"tech design",permalink:"/tags/tech-design"}],version:"current",sidebarPosition:1,frontMatter:{title:"Review Workflows",description:"Review workflow technical design",tags:["review-workflows","implementation","tech design"]},sidebar:"docs",previous:{title:"Introduction",permalink:"/docs/core/admin/ee/intro"},next:{title:"Audit Logs",permalink:"/docs/core/admin/ee/audit-logs"}},d={},a=[{value:"Summary",id:"summary",level:2},{value:"Detailed backend design",id:"detailed-backend-design",level:2},{value:"Content types",id:"content-types",level:3},{value:"strapi_workflows",id:"strapi_workflows",level:4},{value:"strapi_workflows_stages",id:"strapi_workflows_stages",level:4},{value:"Controllers",id:"controllers",level:3},{value:"workflows",id:"workflows",level:4},{value:"stages",id:"stages",level:4},{value:"assignees",id:"assignees",level:4},{value:"Middlewares",id:"middlewares",level:3},{value:"contentTypeMiddleware - <em>DEPRECATED</em>",id:"contenttypemiddleware---deprecated",level:4},{value:"Routes",id:"routes",level:3},{value:"GET <code>/review-workflows/workflows</code>",id:"get-review-workflowsworkflows",level:4},{value:"POST <code>/review-workflows/workflows</code>",id:"post-review-workflowsworkflows",level:4},{value:"GET <code>/review-workflows/workflows/:id</code>",id:"get-review-workflowsworkflowsid",level:4},{value:"PUT <code>/review-workflows/workflows/:id</code>",id:"put-review-workflowsworkflowsid",level:4},{value:"DELETE <code>/review-workflows/workflows/:id</code>",id:"delete-review-workflowsworkflowsid",level:4},{value:"GET <code>/review-workflows/workflows/:workflow_id/stages</code>",id:"get-review-workflowsworkflowsworkflow_idstages",level:4},{value:"GET <code>/review-workflows/workflows/:workflow_id/stages/:id</code>",id:"get-review-workflowsworkflowsworkflow_idstagesid",level:4},{value:"PUT <code>/review-workflows/workflows/:workflow_id/stages</code>",id:"put-review-workflowsworkflowsworkflow_idstages",level:4},{value:"PUT <code>/content-manager/(collection|single)-types/:model_uid/:id/stage</code>",id:"put-content-managercollectionsingle-typesmodel_uididstage",level:4},{value:"GET <code>/content-manager/(collection|single)-types/:model_uid/:id/stages</code>",id:"get-content-managercollectionsingle-typesmodel_uididstages",level:4},{value:"PUT <code>/content-manager/(collection|single)-types/:model_uid/:id/assignee</code>",id:"put-content-managercollectionsingle-typesmodel_uididassignee",level:4},{value:"Services",id:"services",level:3},{value:"review-workflows",id:"review-workflows-1",level:4},{value:"workflows",id:"workflows-1",level:4},{value:"stages",id:"stages-1",level:4},{value:"metrics",id:"metrics",level:4},{value:"weekly-metrics",id:"weekly-metrics",level:4},{value:"assignees",id:"assignees-1",level:4},{value:"stage-permissions",id:"stage-permissions",level:4},{value:"validation",id:"validation",level:4},{value:"Decorators",id:"decorators",level:3},{value:"Entity Service",id:"entity-service",level:4},{value:"Alternatives",id:"alternatives",level:2},{value:"Resources",id:"resources",level:2}];function c(e){const s={a:"a",code:"code",em:"em",h1:"h1",h2:"h2",h3:"h3",h4:"h4",li:"li",p:"p",ul:"ul",...(0,r.R)(),...e.components};return(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)(s.h1,{id:"review-workflows",children:"Review Workflows"}),"\n",(0,o.jsx)(s.h2,{id:"summary",children:"Summary"}),"\n",(0,o.jsx)(s.p,{children:"The review workflow feature is only available in the Enterprise Edition.\nThat is why, in part, it is completely decoupled from the code of the Community Edition."}),"\n",(0,o.jsx)(s.p,{children:"The purpose of this feature is to allow users to assign a tag to the various entities of their Strapi project. This tag is called a 'stage' and is available within what we will call a workflow."}),"\n",(0,o.jsx)(s.h2,{id:"detailed-backend-design",children:"Detailed backend design"}),"\n",(0,o.jsx)(s.p,{children:"The Review Workflow feature have been built with one main consideration, to be decoupled from the Community Edition. As so, the implementation can relate a lot to how a plugin would be built."}),"\n",(0,o.jsxs)(s.p,{children:["All the backend code related to Review Workflow can be found in ",(0,o.jsx)(s.code,{children:"packages/core/admin/ee"}),".\nThis code is separated into several elements:"]}),"\n",(0,o.jsxs)(s.ul,{children:["\n",(0,o.jsxs)(s.li,{children:["Content-types","\n",(0,o.jsxs)(s.ul,{children:["\n",(0,o.jsxs)(s.li,{children:[(0,o.jsx)(s.em,{children:"strapi_workflows"}),": ",(0,o.jsx)(s.code,{children:"packages/core/admin/ee/server/content-types/workflow/index.js"})]}),"\n",(0,o.jsxs)(s.li,{children:[(0,o.jsx)(s.em,{children:"strapi_workflows_stages"}),": ",(0,o.jsx)(s.code,{children:"packages/core/admin/ee/server/content-types/workflow-stage/index.js"})]}),"\n"]}),"\n"]}),"\n",(0,o.jsxs)(s.li,{children:["Controllers","\n",(0,o.jsxs)(s.ul,{children:["\n",(0,o.jsxs)(s.li,{children:[(0,o.jsx)(s.em,{children:"workflows"}),": ",(0,o.jsx)(s.code,{children:"packages/core/admin/ee/server/controllers/workflows/index.js"})]}),"\n",(0,o.jsxs)(s.li,{children:[(0,o.jsx)(s.em,{children:"stages"}),": ",(0,o.jsx)(s.code,{children:"packages/core/admin/ee/server/controllers/workflows/stages/index.js"})]}),"\n",(0,o.jsxs)(s.li,{children:[(0,o.jsx)(s.em,{children:"assignees"}),": ",(0,o.jsx)(s.code,{children:"packages/core/admin/ee/server/controllers/workflows/assignees/index.js"})]}),"\n"]}),"\n"]}),"\n",(0,o.jsxs)(s.li,{children:["Middlewares","\n",(0,o.jsxs)(s.ul,{children:["\n",(0,o.jsxs)(s.li,{children:["[",(0,o.jsx)(s.em,{children:"DEPRECATED"}),"] ",(0,o.jsx)(s.em,{children:"contentTypeMiddleware"}),": ",(0,o.jsx)(s.code,{children:"packages/core/admin/ee/server/middlewares/review-workflows.js"})]}),"\n"]}),"\n"]}),"\n",(0,o.jsxs)(s.li,{children:["Routes","\n",(0,o.jsxs)(s.ul,{children:["\n",(0,o.jsx)(s.li,{children:(0,o.jsx)(s.code,{children:"packages/core/admin/ee/server/routes/index.js"})}),"\n"]}),"\n"]}),"\n",(0,o.jsxs)(s.li,{children:["Services","\n",(0,o.jsxs)(s.ul,{children:["\n",(0,o.jsxs)(s.li,{children:[(0,o.jsx)(s.em,{children:"review-workflows"}),": ",(0,o.jsx)(s.code,{children:"packages/core/admin/ee/server/services/review-workflows/review-workflows.js"})]}),"\n",(0,o.jsxs)(s.li,{children:[(0,o.jsx)(s.em,{children:"workflows"}),": ",(0,o.jsx)(s.code,{children:"packages/core/admin/ee/server/services/review-workflows/workflows.js"})]}),"\n",(0,o.jsxs)(s.li,{children:[(0,o.jsx)(s.em,{children:"stages"}),": ",(0,o.jsx)(s.code,{children:"packages/core/admin/ee/server/services/review-workflows/stages.js"})]}),"\n",(0,o.jsxs)(s.li,{children:[(0,o.jsx)(s.em,{children:"metrics"}),": ",(0,o.jsx)(s.code,{children:"packages/core/admin/ee/server/services/review-workflows/metrics.js"})]}),"\n",(0,o.jsxs)(s.li,{children:[(0,o.jsx)(s.em,{children:"weekly-metrics"}),": ",(0,o.jsx)(s.code,{children:"packages/core/admin/ee/server/services/review-workflows/weekly-metrics.js"})]}),"\n",(0,o.jsxs)(s.li,{children:[(0,o.jsx)(s.em,{children:"validation"}),": ",(0,o.jsx)(s.code,{children:"packages/core/admin/ee/server/services/review-workflows/validation.js"})]}),"\n",(0,o.jsxs)(s.li,{children:[(0,o.jsx)(s.em,{children:"assignees"}),": ",(0,o.jsx)(s.code,{children:"packages/core/admin/ee/server/services/review-workflows/assignees.js"})]}),"\n",(0,o.jsxs)(s.li,{children:[(0,o.jsx)(s.em,{children:"stage-permissions"}),": ",(0,o.jsx)(s.code,{children:"packages/core/admin/ee/server/services/review-workflows/stage-permissions.js"})]}),"\n"]}),"\n"]}),"\n",(0,o.jsxs)(s.li,{children:["Decorators","\n",(0,o.jsxs)(s.ul,{children:["\n",(0,o.jsxs)(s.li,{children:[(0,o.jsx)(s.em,{children:"EntityService"})," decorator: ",(0,o.jsx)(s.code,{children:"packages/core/admin/ee/server/services/review-workflows/entity-service-decorator.js"})]}),"\n"]}),"\n"]}),"\n",(0,o.jsxs)(s.li,{children:["Utils file","\n",(0,o.jsxs)(s.ul,{children:["\n",(0,o.jsxs)(s.li,{children:[(0,o.jsx)(s.em,{children:"Review workflows utils"}),": ",(0,o.jsx)(s.code,{children:"packages/core/admin/ee/server/utils/review-workflows.js"})]}),"\n"]}),"\n"]}),"\n",(0,o.jsxs)(s.li,{children:["A bootstrap and a register part","\n",(0,o.jsxs)(s.ul,{children:["\n",(0,o.jsx)(s.li,{children:(0,o.jsx)(s.code,{children:"packages/core/admin/ee/server/bootstrap.js"})}),"\n",(0,o.jsx)(s.li,{children:(0,o.jsx)(s.code,{children:"packages/core/admin/ee/server/register.js"})}),"\n"]}),"\n"]}),"\n"]}),"\n",(0,o.jsx)(s.h3,{id:"content-types",children:"Content types"}),"\n",(0,o.jsx)(s.h4,{id:"strapi_workflows",children:"strapi_workflows"}),"\n",(0,o.jsx)(s.p,{children:"This content type stores the workflow information and is responsible for holding all the information about stages and their order. In MVP, only one workflow is stored inside the Strapi database."}),"\n",(0,o.jsx)(s.h4,{id:"strapi_workflows_stages",children:"strapi_workflows_stages"}),"\n",(0,o.jsx)(s.p,{children:"This content type store the stage information such as its name."}),"\n",(0,o.jsx)(s.h3,{id:"controllers",children:"Controllers"}),"\n",(0,o.jsx)(s.h4,{id:"workflows",children:"workflows"}),"\n",(0,o.jsxs)(s.p,{children:["Used to interact with the ",(0,o.jsx)(s.code,{children:"strapi_workflows"})," content-type."]}),"\n",(0,o.jsx)(s.h4,{id:"stages",children:"stages"}),"\n",(0,o.jsxs)(s.p,{children:["Used to interact with the ",(0,o.jsx)(s.code,{children:"strapi_workflows_stages"})," content-type."]}),"\n",(0,o.jsx)(s.h4,{id:"assignees",children:"assignees"}),"\n",(0,o.jsxs)(s.p,{children:["Used to interact with the ",(0,o.jsx)(s.code,{children:"admin_users"})," content-type entities related to review workflow enabled content types."]}),"\n",(0,o.jsx)(s.h3,{id:"middlewares",children:"Middlewares"}),"\n",(0,o.jsxs)(s.h4,{id:"contenttypemiddleware---deprecated",children:["contentTypeMiddleware - ",(0,o.jsx)(s.em,{children:"DEPRECATED"})]}),"\n",(0,o.jsxs)(s.p,{children:["In order to properly manage the options for content-type in the root level of the object, it is necessary to relocate the ",(0,o.jsx)(s.code,{children:"reviewWorkflows"})," option within the ",(0,o.jsx)(s.code,{children:"options"})," object located inside the content-type data. By doing so, we can ensure that all options are consistently organized and easily accessible within their respective data structures. This will also make it simpler to maintain and update the options as needed, providing a more streamlined and efficient workflow for developers working with the system. Therefore, it is recommended to move the reviewWorkflows option to its appropriate location within the options object inside the content-type data before sending it to the admin API."]}),"\n",(0,o.jsx)(s.h3,{id:"routes",children:"Routes"}),"\n",(0,o.jsx)(s.p,{children:"The Admin API of the Enterprise Edition includes several routes related to the Review Workflow feature. Here is a list of those routes:"}),"\n",(0,o.jsxs)(s.h4,{id:"get-review-workflowsworkflows",children:["GET ",(0,o.jsx)(s.code,{children:"/review-workflows/workflows"})]}),"\n",(0,o.jsx)(s.p,{children:"This route returns a list of all workflows."}),"\n",(0,o.jsxs)(s.h4,{id:"post-review-workflowsworkflows",children:["POST ",(0,o.jsx)(s.code,{children:"/review-workflows/workflows"})]}),"\n",(0,o.jsx)(s.p,{children:"This route creates a new workflow."}),"\n",(0,o.jsxs)(s.h4,{id:"get-review-workflowsworkflowsid",children:["GET ",(0,o.jsx)(s.code,{children:"/review-workflows/workflows/:id"})]}),"\n",(0,o.jsx)(s.p,{children:"This route returns the details of a specific workflow identified by the id parameter."}),"\n",(0,o.jsxs)(s.h4,{id:"put-review-workflowsworkflowsid",children:["PUT ",(0,o.jsx)(s.code,{children:"/review-workflows/workflows/:id"})]}),"\n",(0,o.jsx)(s.p,{children:"This route updates a specific workflow identified by the id parameter."}),"\n",(0,o.jsxs)(s.h4,{id:"delete-review-workflowsworkflowsid",children:["DELETE ",(0,o.jsx)(s.code,{children:"/review-workflows/workflows/:id"})]}),"\n",(0,o.jsx)(s.p,{children:"This route deletes a specific workflow identified by the id parameter."}),"\n",(0,o.jsxs)(s.h4,{id:"get-review-workflowsworkflowsworkflow_idstages",children:["GET ",(0,o.jsx)(s.code,{children:"/review-workflows/workflows/:workflow_id/stages"})]}),"\n",(0,o.jsx)(s.p,{children:"This route returns a list of all stages associated with a specific workflow identified by the workflow_id parameter."}),"\n",(0,o.jsxs)(s.h4,{id:"get-review-workflowsworkflowsworkflow_idstagesid",children:["GET ",(0,o.jsx)(s.code,{children:"/review-workflows/workflows/:workflow_id/stages/:id"})]}),"\n",(0,o.jsx)(s.p,{children:"This route returns the details of a specific stage identified by the id parameter and associated with the workflow identified by the workflow_id parameter."}),"\n",(0,o.jsxs)(s.h4,{id:"put-review-workflowsworkflowsworkflow_idstages",children:["PUT ",(0,o.jsx)(s.code,{children:"/review-workflows/workflows/:workflow_id/stages"})]}),"\n",(0,o.jsx)(s.p,{children:"This route updates the stages associated with a specific workflow identified by the workflow_id parameter. The updated stages are passed in the request body."}),"\n",(0,o.jsxs)(s.h4,{id:"put-content-managercollectionsingle-typesmodel_uididstage",children:["PUT ",(0,o.jsx)(s.code,{children:"/content-manager/(collection|single)-types/:model_uid/:id/stage"})]}),"\n",(0,o.jsx)(s.p,{children:"This route updates the stage of a specific entity identified by the id parameter and belonging to a specific collection identified by the model_uid parameter. The new stage value is passed in the request body."}),"\n",(0,o.jsxs)(s.h4,{id:"get-content-managercollectionsingle-typesmodel_uididstages",children:["GET ",(0,o.jsx)(s.code,{children:"/content-manager/(collection|single)-types/:model_uid/:id/stages"})]}),"\n",(0,o.jsx)(s.p,{children:"Returns a list of stages that a user has permission to transition into (based on the permission settings of a stage)."}),"\n",(0,o.jsxs)(s.h4,{id:"put-content-managercollectionsingle-typesmodel_uididassignee",children:["PUT ",(0,o.jsx)(s.code,{children:"/content-manager/(collection|single)-types/:model_uid/:id/assignee"})]}),"\n",(0,o.jsx)(s.p,{children:"This route updates the assignee of the entity identified by the model_uid and id parameters. The updated entity is passed to the request body."}),"\n",(0,o.jsx)(s.h3,{id:"services",children:"Services"}),"\n",(0,o.jsx)(s.p,{children:"The Review Workflow feature of the Enterprise Edition includes several services to manipulate workflows and stages. Here is a list of those services:"}),"\n",(0,o.jsx)(s.h4,{id:"review-workflows-1",children:"review-workflows"}),"\n",(0,o.jsx)(s.p,{children:"This service is used during the bootstrap and register phases of Strapi. Its primary responsibility is to migrate data on entities as needed and add the stage field to the entity schemas."}),"\n",(0,o.jsx)(s.h4,{id:"workflows-1",children:"workflows"}),"\n",(0,o.jsx)(s.p,{children:"This service is used to manipulate the workflows entities. It provides functionalities to create, retrieve, and update workflows."}),"\n",(0,o.jsx)(s.h4,{id:"stages-1",children:"stages"}),"\n",(0,o.jsx)(s.p,{children:"This service is used to manipulate the stages entities and to update stages on other entities. It provides functionalities to create, retrieve, update, and delete stages."}),"\n",(0,o.jsx)(s.h4,{id:"metrics",children:"metrics"}),"\n",(0,o.jsx)(s.p,{children:"This is the telemetry service used to gather information on the usage of this feature. It provides information on the number of workflows and stages created, as well as the frequency of stage updates on entities."}),"\n",(0,o.jsx)(s.h4,{id:"weekly-metrics",children:"weekly-metrics"}),"\n",(0,o.jsx)(s.p,{children:"Once a week we report on review workflows usage statistic. This service is used to set up the cron job responsible for gathering and sending statistics on: number of active workflows, average number of stages in a workflow, maximum number of stages across all workflows and the content types on which review workflows is activated."}),"\n",(0,o.jsx)(s.h4,{id:"assignees-1",children:"assignees"}),"\n",(0,o.jsx)(s.p,{children:"This service is used to interact with admin user assignee relations on review workflow enabled content types. It provides the ability to: find the Id of an entity assignee, update and delete (unassign) the assignee on an entity."}),"\n",(0,o.jsx)(s.h4,{id:"stage-permissions",children:"stage-permissions"}),"\n",(0,o.jsxs)(s.p,{children:["This service is used to enable RBAC functionality for review workflow stages. Each entry of the ",(0,o.jsx)(s.code,{children:"strapi_workflows_stages"})," has a manyToMany relation with ",(0,o.jsx)(s.code,{children:"admin_permissions"}),". The permissions held in this relation indicate which roles can change the review stage of an entry in this stage. The service provides the ability to: register and unregister new stage permissions based on stage and role Ids and to find out whether a role can transition from a given stage."]}),"\n",(0,o.jsx)(s.h4,{id:"validation",children:"validation"}),"\n",(0,o.jsx)(s.p,{children:"This service is used to ensure the feature is working as expected and validate the data to be valid."}),"\n",(0,o.jsx)(s.h3,{id:"decorators",children:"Decorators"}),"\n",(0,o.jsx)(s.h4,{id:"entity-service",children:"Entity Service"}),"\n",(0,o.jsx)(s.p,{children:"The entity service is decorated so that entities can be linked to a default stage upon creation. This allows the entities to be automatically associated with a specific workflow stage when they are created."}),"\n",(0,o.jsx)(s.h2,{id:"alternatives",children:"Alternatives"}),"\n",(0,o.jsx)(s.p,{children:"The Review Workflow feature is currently included as a core feature within the Strapi repository. However, there has been discussion about potentially moving it to a plugin in the future. While no decision has been made on this subject yet, it is possible that it may happen at some point in the future."}),"\n",(0,o.jsx)(s.h2,{id:"resources",children:"Resources"}),"\n",(0,o.jsxs)(s.ul,{children:["\n",(0,o.jsx)(s.li,{children:(0,o.jsx)(s.a,{href:"https://docs.strapi.io/user-docs/settings/review-workflows",children:"https://docs.strapi.io/user-docs/settings/review-workflows"})}),"\n",(0,o.jsx)(s.li,{children:(0,o.jsx)(s.a,{href:"https://docs.strapi.io/user-docs/content-type-builder/creating-new-content-type#creating-a-new-content-type",children:"https://docs.strapi.io/user-docs/content-type-builder/creating-new-content-type#creating-a-new-content-type"})}),"\n",(0,o.jsx)(s.li,{children:(0,o.jsx)(s.a,{href:"https://docs.strapi.io/user-docs/users-roles-permissions/configuring-administrator-roles#plugins-and-settings",children:"https://docs.strapi.io/user-docs/users-roles-permissions/configuring-administrator-roles#plugins-and-settings"})}),"\n",(0,o.jsx)(s.li,{children:(0,o.jsx)(s.a,{href:"/docs/core/content-manager/review-workflows",children:"Content Manager Review Workflows"})}),"\n",(0,o.jsx)(s.li,{children:(0,o.jsx)(s.a,{href:"../../content-type-builder/01-review-workflows.mdx",children:"Content Type Builder Review Workflows"})}),"\n"]})]})}function w(e={}){const{wrapper:s}={...(0,r.R)(),...e.components};return s?(0,o.jsx)(s,{...e,children:(0,o.jsx)(c,{...e})}):c(e)}},8453:(e,s,i)=>{i.d(s,{R:()=>n,x:()=>l});var o=i(6540);const r={},t=o.createContext(r);function n(e){const s=o.useContext(t);return o.useMemo((function(){return"function"==typeof e?e(s):{...s,...e}}),[s,e])}function l(e){let s;return s=e.disableParentContext?"function"==typeof e.components?e.components(r):e.components||r:n(e.components),o.createElement(t.Provider,{value:s},e.children)}}}]);