Bricks
A Brick is a visually editable content block for React Bricks. Developers create these blocks, which content editors then use to build pages.

Creating Custom Bricks
Creating custom bricks is the heart of developing with React Bricks. This custom bricks form your unique “Lego set” of content blocks that embody your corporate image or that of your client.

Within a Brick, developers define what’s visually editable using React Bricks visual components. They also control the level of freedom given to content editors through sidebar controls—for example, allowing adjustments to properties like padding or background color.

Since Bricks are simply React components, developers can easily start using React Bricks and convert existing components into visually editable bricks.

Admin Interface
In the Starter projects, the Admin interface is accessible at the /admin path.
It’s pre-configured for you, using React Bricks’ <Admin>, <Login>, <Editor>, <MediaLibrary>, <Playground> and <AppSettings> components.

By default, the Admin Interface offers four main views (unless you customize the Menu items):

Editor: The primary view for creating pages and editing content.
Media: A comprehensive Digital Assets Management (DAM) system.
Playground: A preview area for all Bricks and Page Types
Settings / Deploy: Enables Editors to trigger static website rebuilds (for Netlify or Vercel hosting). Admins have a more powerful interface to access the React Bricks Dashboard where they can configure all the App settings and manage User invitations.
Editor
This section allows content creators (Admin or Editor users) to edit the website pages content.

Left panel (Pages)
The left panel displays Pages, organized by Page Type.

Selecting a Page allows you to edit its content.

Central panel (content editor)
The central panel serves two main purposes:

Visual editing of block content (Text, Images)
Adding, removing, and reordering blocks
Right panel (Page, Block, Item, Stories)
The right panel consists of three tabs:

Page: Edit page properties, such as Name, Slug, Author, SEO attributes (Meta tags, OpenGraph, Twitter cards, Schema.org structured data), set the page status (draft / published, locked / unlocked), schedule publishing, and delete the page.
Block: Edit block properties as defined in the Brick’s sideEditProps (e.g. background color, padding), and manage repeater items (used in <Repeater> components).
Item: Edit block properties of a repeater item
Stories: Save a brick’s current state to apply the same text, images and props to other content blocks later. This feature allows you to create configuration templates for your bricks. Stories can both be created in code by developers, or by the editors. In this second case, they are stored on our APIs, ensuring persistence across users without code changes.
Playground
Left panel
The left panel displays all Block types and, below them, all Page types. Clicking on a Block or Page reveals its details on the right.

Central panel
This panel shows the default content for a block or page. Here, you can test the block’s functionality with WYSIWYG editing and side-edit props. You can also capture a component screenshot by clicking the pink button. The screenshot’s image URL is copied to your clipboard, to set the previewImageUrl in the brick’s schema.

Right panel
For a Brick, you’ll be able to see all the editable sidebar controls and in which page types the brick is allowed.

App Settings
Admin users can access the React Bricks Dashboard to configure every aspect of a React Bricks App. Users

Users with Editor roles only see the “Deploy” button to initiate rebuilds.

Click to edit
When logged into the Admin interface and browsing the live website, you’ll see a small pencil icon. Clicking this icon takes you directly to the Admin interface for editing the current page.

Through React Bricks configuration’s clickToEditSide setting, which corner the “click to edit” button appears in, or disable it entirely (see ClickToEditSide).

Pages, Page Types, Templates
Pages
A Page in React Bricks represent a unit of content.

It corresponds to a website page or a blog post, but can also store content fragments reusable across different pages.

A page has content, type, slug, name, author, meta values, statuses (visibility, lock, approval phase, etc.), tags, and creation date.

The content of a page is an array of content blocks. Each block has an id, a type (referencing the corresponding brick name) and props to pass to the brick’s component.

A page can also be based on a Page Template. In this case, its content is more structured, as content blocks belong to one of the Template’s Slots.

Page Types
Developer can define multiple Page Types in code through the pageTypes configuration. In the starter templates, you can edit Page Types in the pageTypes.ts file.

Each Page Type has:

name (required): A unique string representing the page type
pluralName (required): Used by the content administration interface
defaultLocked: Boolean, default false
defaultStatus: types.PageStatus.Published or types.PageStatus.Draft
getDefaultContent: A function returning the default content (array of brick’s names, stories or full content)
isEntity: Boolean, default false. If true, pages of this type appear in the “Entities” tab (useful for reusable fragments like Header, Footer, etc.).
allowedBlockTypes: Array of allowed bricks. If not provided, all bricks are allowed.
getExternalData: Async function (receiving the page object as an argument) that resolves to an object, fetching data from an external API. The returned data is available in the externalData object on the page and can be consumed directly (usePageValues) or from a single brick via the mapExternalDataToProps function in the brick’s schema.
getDefaultMeta: Function (receiving the page object and externalData object as arguments) to return default meta values for a new page (e.g. set Schema.org data on a product from a headless commerce structured data).
template: An array of Slots defining a page template (see next section).
Page Template
Sometimes you want to restrict editors’ freedom when composing a page. You might want fixed sections, blocks that can’t be removed, areas where editors can use only a subset of bricks, or even non-editable sections. Templates serve this purpose.

A template is an array of slots, where each slot has these properties:

slotName (required): The name of the slot, unique within this pageType
label (required): A label displayed in the editing interface
allowedBlockTypes: Array of strings with the names of allowed bricks
getDefaultContent: Function that returns the default content for the slot, with the same signature as getDefaultContent at pageType level
min: Minimum number of blocks (applied when there is only one type in allowedBlockTypes)
max: maximum number of blocks
editable: if false the slot is not editable at all

Deploy your site
Hosting Requirements
You can host a React Bricks website almost anywhere.

You only need a hosting environment capable of running Node.js (to build the website, for Static Site Generation or to build pages at runtime, for Server Side Rendering). Any hosting platform such as Netlify, Vercel, AWS, Azure will work perfectly.

Environment variables
React Bricks needs 2 environment variables. These are typically stored in your local .env file and must be set in the hosting provider’s environment variables:

APP_ID: This variable must be accessible by the browser and is used by the Admin interface.
API_KEY: This is the secret API_KEY which should not be exposed to the browser.
To expose the APP_ID variable to the browser, use NEXT_PUBLIC_APP_ID for Next.js and GATSBY_APP_ID for Gatsby.

Build Hooks
Providers like Netlify or Vercel, which connect to your Github or Bitbucket repo, can trigger a rebuild when you push changes to the repo. However, this doesn’t address changes in CMS content.

Most providers allow you to create a Build hook—a URL that, when called (typically via HTTP POST), triggers a site rebuild.

React Bricks allows the Admin to set up two deploy hooks for an App: one for the Production environment and one for Staging (plus a third “Development” hook in case of Enterprise plans).

These can be configured from the React Bricks Dashboard.

The Admin can grant Editors permission to trigger Development, Staging or Production deploys by simply clicking a button in the App Settings interface.

Events hook
For Enterprise plan, you can also provide an Events web hook that will receive a notification for each event of pages (creation, update, delete, etc.), with a proper payload for each type of action. In this way you can implement a logging system or react to actions in an external application.
Introduction to Bricks
What is a Brick?
A Brick is essentially a React component, that:

Uses React Bricks visual editing components (Text, RichText, Image, Repeater, Link, File) in the JSX to enable inline Visual Editing of content;
Has a schema property to define a unique name, default properties and specify Sidebar Controls that allow editors to modify certain props.
Below, you’ll find a simple brick example. In the following sections, we’ll explore how to use React Bricks visual editing components and properly configure a brick’s schema.

Meet your first Brick
Here’s an example “Hero Unit” brick. In the JSX code, you’ll notice a React Bricks RichText component that makes text visually editable. The schema defines the brick’s name and includes a sidebar control of type Select allowing editors to adjust the padding.

HeroUnit.tsx
import { types, RichText } from 'react-bricks/frontend'

// Component interface
interface HeroUnitProps {
  title: types.TextValue
  padding: 'big' | 'small'
}

// The React Component
const HeroUnit: types.Brick<HeroUnitProps> = ({ title, padding }) => {
  return (
    <div className={`${padding === 'big' ? 'py-20' : 'py-12'}`}>
      <RichText
        propName="title"
        value={title}
        placeholder="Type a title..."
        renderBlock={({ children }) => (
          <h1 className="text-3xl text-center">{children}</h1>
        )}
        allowedFeatures={[types.RichTextFeatures.Bold]}
      />
    </div>
  )
}

// The Brick's Schema
HeroUnit.schema = {
  name: 'hero-unit',
  label: 'Hero Unit',
  getDefaultProps: () => ({
    padding: 'big',
    title: 'Thick as a React Brick',
  }),

  // Sidebar Controls Definition
  sideEditProps: [
    {
      name: 'padding',
      label: 'Padding',
      type: types.SideEditPropType.Select,
      selectOptions: {
        display: types.OptionsDisplay.Radio,
        options: [
          { value: 'big', label: 'Big' },
          { value: 'small', label: 'Small' },
        ],
      },
    },
  ],
}
export default HeroUnit

Adding a brick to the React Bricks configuration
After creating a new brick, you need to add it to the available bricks to make it visible in the Editor. You can find the available bricks in the react-bricks/bricks/index.ts file.

Bricks are organized into Themes. For example, if your company name is “Acme,” you could create an “Acme” theme to host all your custom bricks that define Acme’s website design system.

Within each theme, bricks can be further organized into Categories (e.g., “Hero Sections,” “CTAs,” “Blog Content,” “Features”).

Let’s demonstrate how to add a “HeroUnit” brick to the Acme theme’s bricks under the “Hero Sections” category:

/react-bricks/bricks/index.ts
import { types } from 'react-bricks/rsc'

import HeroUnit from './acme-theme/HeroUnit'

const bricks: types.Theme[] = [
  {
    themeName: 'Acme',
    categories: [
      {
        categoryName: 'Hero Sections',
        bricks: [HeroUnit, ...],
      },
    ],
  },
]

export default bricks


Visual Editing
Visual Editing is one of React Bricks’ strongest unique selling propositions.

In your Bricks, you can use React Bricks’ Visual Editing components to enable inline editing of text and images directly on the content, eliminating the need for a cumbersome preview system.
React Bricks also allows for infinite nesting of bricks within bricks, enabling the creation of galleries, features, buttons in hero units, or pricing pages.

Visual components
The following are the visual editing components. Each has a dedicated page in the subsequent sections of the documentation:

Text
For editable plain text. Provide a render function to render your JSX.
RichText
For editable rich text. Choose the allowed rich-text capabilities and override the default render functions.
Image
For editable images. Select from the Media Library, upload, use Unsplash, or input a URL. Crop, rotate, or flip images. Images are optimized and served from a CDN.
Repeater
To repeat multiple nested items, such as images in a gallery. Allows for infinite nesting of bricks and multiple item types per repeater.
Link
Simplifies link management for standalone links or within RichText render functions. It uses the framework's link component for local paths.
File
Enables editors to upload files and provides a render function for frontend downloads. Files are served from a global CDN.
RichTextExt
An extensible RichText component that allows for the creation of custom RichText plugins for advanced use cases.

Text
The Text component enables content editors to edit plain text.

Required properties:

propName: the name of the prop
value: prop’s value (strictly needed only for RSC, but it’s avisable to always provide it for server componenents compatibility)
renderBlock: the render function for this text (the render function for this text (not strictly required; if missing, it renders a simple <span>)
Usage example
// from 'react-bricks/rsc' for usage with server components
import { types, Text } from 'react-bricks/frontend'

interface MyBrickProps {
  title: types.TextValue
}

const MyBrick: types.Brick<MyBrickProps> = ({ title }) => (
  ...
  <Text
    propName="title"
    value={title}
    renderBlock={({ children }) => (
      <h1 className="text-xl font-extrabold">{children}</h1>
    )}
    placeholder="Title..."
  />
  ...
)

MyBrick.schema = { ... }

export default MyBrick

Multi-line
By default, editors can enter a single line of text in a Text component. You can change this behavior by setting the following props:

multiline (false by default): it allows entering multiple lines, each rendering the JSX returned by the renderBlock function
softLineBreak (false by default): if true, it allows entering a soft line break (<br />) using shift+enter
Bind to Meta data or Custom fields
A Text component is typically used to save a text value for the current block in the page.

You can also bind it to a page’s custom field or meta field by replacing propName with customFieldName or metaFieldName. This creates a two-way data binding between the visual editing component and the values you can enter via the sidebar controls in the “Page” tab.

This feature is useful, for example, when you want the title of a hero unit on the page to also set the meta title of the page directly.

Properties
Here’s the Typescript interface for the props of the Text component:

// Props for all the usages of Text
interface BaseTextProps {
  renderBlock?: (props: RenderElementProps) => JSX.Element
  placeholder?: string
  renderPlaceholder?: (props: { children: any }) => JSX.Element
  multiline?: boolean
  softLineBreak?: boolean
}

// Usage with propName (usual case)
interface TextPropsWithPropName extends BaseTextProps {
  propName: string
  value?: types.TextValue
  metaFieldName?: never
  customFieldName?: never
}

// Usage when binding to a Meta Field
interface TextPropsWithMetaFieldName extends BaseTextProps {
  propName?: never
  value?: never
  metaFieldName: 'title' | 'description' | 'language'
  customFieldName?: never
}

// Usage when binding to a Custom Field
interface TextPropsWithCustomFieldName extends BaseTextProps {
  propName?: never
  value?: never
  metaFieldName?: never
  customFieldName: string
}

/**
 * Props for Text component
 */
type TextProps =
  | TextPropsWithPropName
  | TextPropsWithMetaFieldName
  | TextPropsWithCustomFieldName

Properties definition
Property	Definition
propName	The prop of the Brick component corresponding to this text. Mandatory unless you bind the value to a metaFieldName or customFieldName
value	The value of the prop for this text. Required for Server Components, but always recommended for RSC compatibility
renderBlock	A React functional component used to render the text.
placeholder	The placeholder to show when the text is empty.
renderPlaceholder	A React functional component used to render the placeholder, for custom display.
multiline	Default: false. If true allows multiline text.
softLineBreak	Default: false. If true allows soft line breaks.
metaFieldName	Binds the text value to a page Meta field (two-way data binding)
customFieldName	Binds the text value to a page Custom field (two-way data binding)
Usage with Server Components
When working with Server Components, you need to import from 'react-bricks/rsc':

import { types, Text } from 'react-bricks/rsc'

RichText
The RichText component enables content editors to edit a multiline rich text.

It is similar to the Text component, but it allows you to select which rich text features editors can use, such as bold, italic, link, highlight, quote, code, headings (H1..H6), ordered list, unordered list, superscript, and subscript.

You can also customize the default render function for each style.

Required properties:

propName: the name of the prop
value: prop’s value (strictly needed only for RSC, but it’s avisable to always provide it for server componenents compatibility)
renderBlock: the render function for this text (not strictly required, defaults to a simple <span> if omitted)
allowedFeatures: the available rich-text features (none by default)
Usage example
// from 'react-bricks/rsc' for usage with server components
import { types, RichText, Link } from 'react-bricks/frontend'

interface MyBrickProps {
  description: types.TextValue
}

const MyBrick: types.Brick<MyBrickProps> = ({ description }) => (
  ...
  <RichText
    propName="description"
    value={description}
    renderBlock={({ children }) => (
      <p className="text-lg text-gray-600">{children}</p>
    )}
    placeholder="Type a description..."

    allowedFeatures={[
      types.RichTextFeatures.Bold,
      types.RichTextFeatures.Italic,
      types.RichTextFeatures.Link,
      //types.RichTextFeatures.Highlight,
      //types.RichTextFeatures.Heading1,
      //types.RichTextFeatures.Heading2,
      //types.RichTextFeatures.Heading3,
      //types.RichTextFeatures.Heading4,
      //types.RichTextFeatures.Heading5,
      //types.RichTextFeatures.Heading6,
      //types.RichTextFeatures.Code,
      //types.RichTextFeatures.Quote,
      //types.RichTextFeatures.OrderedList,
      //types.RichTextFeatures.UnorderedList,
      //types.RichTextFeatures.Subscript,
      //types.RichTextFeatures.Superscript,
    ]}

    // Override default <b> tag for Bold style
    renderBold={({ children }) => (
      <b className="text-pink-500">
        {children}
      </b>
    )}

    // Override rendering for Links
    renderLink={({ children, href, target, rel }) => (
      <Link
        href={href}
        target={target}
        rel={rel}
        className="text-sky-500 hover:text-sky-600 transition-colors"
      >
        {children}
      </Link>
    )}
  />
  ...
)

MyBrick.schema = { ... }

export default MyBrick

Multi-line
By default, the RichText component allows multiple lines of text. You can modify this behavior with these props:

multiline (default: true): if false, prevents the content editor from creating multiple lines with the Enter key
softLineBreak (default: true): if false, disables the soft line break (<br />)
Bind to Meta data or Custom fields
Typically, a RichText component is used to save a text value for the current block in the page.

You can also bind it to a page’s custom field or meta field by using customFieldName or metaFieldName instead of propName. This creates a two-way data binding between the visual editing component and the values in the sidebar controls of the “Page” tab. For custom fields, you can opt to save the value as plain text using the customFieldPlainText prop.

Properties
Here’s the Typescript interface for the RichText component props:

// For every RichText usage
interface BaseRichTextProps {
  renderBlock?: (props: { children: React.ReactNode }) => JSX.Element
  placeholder?: string
  renderPlaceholder?: (props: { children: React.ReactNode }) => JSX.Element
  multiline?: boolean
  softLineBreak?: boolean
  allowedFeatures?: types.RichTextFeatures[]
  renderBold?: (props: { children: React.ReactNode }) => JSX.Element
  renderItalic?: (props: { children: React.ReactNode }) => JSX.Element
  renderHighlight?: (props: { children: React.ReactNode }) => JSX.Element
  renderCode?: (props: { children: React.ReactNode }) => JSX.Element
  rendersSub?: (props: { children: React.ReactNode }) => JSX.Element
  renderSup?: (props: { children: React.ReactNode }) => JSX.Element
  renderLink?: (props: { href: string, target?: string. rel?: string }) => JSX.Element
  renderUL?: (props: { children: React.ReactNode }) => JSX.Element
  renderOL?: (props: { children: React.ReactNode }) => JSX.Element
  renderLI?: (props: { children: React.ReactNode }) => JSX.Element
  renderH1?: (props: { children: React.ReactNode }) => JSX.Element
  renderH2?: (props: { children: React.ReactNode }) => JSX.Element
  renderH3?: (props: { children: React.ReactNode }) => JSX.Element
  renderH4?: (props: { children: React.ReactNode }) => JSX.Element
  renderH5?: (props: { children: React.ReactNode }) => JSX.Element
  renderH6?: (props: { children: React.ReactNode }) => JSX.Element
  renderQuote?: (props: { children: React.ReactNode }) => JSX.Element
}

// Usage with propName (usual case)
interface RichTextPropsWithPropName extends BaseRichTextProps {
  propName: string
  value?: types.TextValue
  metaFieldName?: never
  customFieldName?: never
  customFieldPlainText?: never
}

interface RichTextPropsWithMetaFieldName extends BaseRichTextProps {
  propName?: never
  value?: never
  metaFieldName: 'title' | 'description' | 'language'
  customFieldName?: never
  customFieldPlainText?: never
}

interface RichTextPropsWithCustomFieldName extends BaseRichTextProps {
  propName?: never
  value?: never
  metaFieldName?: never
  customFieldName: string
  customFieldPlainText?: boolean
}

/**
 * Props for RichText component
 */
type RichTextProps =
  | RichTextPropsWithPropName
  | RichTextPropsWithMetaFieldName
  | RichTextPropsWithCustomFieldName

Properties definition
Property	Definition
propName	The prop of the Brick component corresponding to this text.
value	The value of the prop for this rich text. Required for Server Components, but always recommended for RSC compatibility
renderBlock	A React functional component used to render each paragraph of text.
placeholder	The placeholder to show when the text is empty.
renderPlaceholder	A React functional component used to render the placeholder, for custom display.
multiline	Default: true. If false it prevents multiline text.
softLineBreak	Default: true. If false it prevents soft line breaks.
allowedFeatures	An array of allowed rich text features: the available features are of type types.RichTextFeatures
metaFieldName	Binds the text value to a page Meta field (two-way data binding)
customFieldName	Binds the text value to a page Custom field (two-way data binding)
renderBold	The optional render function for the BOLD marker.
renderItalic	The optional render function for the ITALIC marker.
renderCode	The optional render function for the CODE marker.
renderHighlight	The optional render function for the HIGHLIGHT marker.
renderLink	The optional render function for the LINK marker. Warning: this overrides the default React Bricks Link component (which uses the configured renderLocalLink for local links and a <a> tag for external links).
renderUL	The optional render function for Unordered Lists.
renderOL	The optional render function for Ordered Lists.
renderLI	The optional render function for List Items.
renderH1..H6	The optional render function for Headings.
renderQuote	The optional render function for Quote.
renderSub	The optional render function for Subscript.
renderSup	The optional render function for Superscript.
Usage with Server Components
When working with Server Components, you need to import from 'react-bricks/rsc':

import { types, RichText, Link } from 'react-bricks/rsc'

Create custom plugins
To enhance the RichText component’s default functionality, such as adding an emoji button, you can use the RichTextExt component. This component is designed to be extended with custom plugins.

With RichTextExt, you can develop sophisticated rich text features, including those requiring configuration popups with custom fields. For more information, see the Extensible RichText documentation.

Image
The Image component enables content editors to upload/select and modify images.

Required properties:

propName: the name of the prop
source: prop’s value (strictly needed only for RSC, but it’s avisable to always provide it for server componenents compatibility)
Other frequently used props:
aspectRatio: forces editors to crop an image with a fixed aspect ratio (e.g. 16 : 9)
alt: fallback alternate text, used if editors don’t provide ALT text via the interface
maxWidth: instructs React Bricks image optimization on the maximum displayed size for this image
quality: sets the image compression quality (default 80)
sizes: provides fine-tuned image direction via the “sizes” attribute
imageClassName: class name applied to the rendered image
Usage example
import { types, Image } from 'react-bricks/frontend'

interface MyBrickProps {
  image: types.IImageSource
}

const MyBrick: types.Brick<MyBrickProps> = ({ image }) => (
  ...
  <Image
    propName="image"
    source={image}
    alt="Product"
    maxWidth="650"
    aspectRatio="1.33"
  />
  ...
)

MyBrick.schema = { ... }

export default MyBrick

Rendering
On the frontend, the Image component displays a responsive, optimized image with progressive loading (lazy load).
In the Admin interface, it allows to replace an image by opening a modal where editors can:
Replace an image from the media library, Unsplash, upload, or URL
Apply transformations (crop, rotate, flip)
Set the alternate text (ALT), SEO-friendly name (for the image URL), and priority for images above the fold
Optimization
To boost performance and SEO, upon upload, React Bricks will:

Create responsive optimized images
Create the srcSet for optimal image selection on the frontend
Create a lightweight blurred placeholder for progressive loading when the native lazy loading is unavailable
Serve images from a global CDN
Enforce SEO-friendly name via proper rewrite rules
Readonly
To render an image loaded in React Bricks as read-only, add the readonly flag.

A common use case is rendering blog post thumbnails in a list of posts loaded via the fetchPages function. You can render a thumbnail for each post using <Image readonly source={...}>.

Bind to Meta data or Custom fields
As for Text and RichText, you can also bind an image to a page’s custom field or meta image by replacing propName with customFieldName or metaFieldName.

This creates a two-way data binding between the visual editing component and the images set via sidebar controls in the “Page” tab.

Properties
Here’s the Typescript interface for the props of the Image component:

// For both editable and readonly images
interface SharedImageProps {
  readonly?: boolean
  source?: types.IImageSource
  alt: string
  noLazyLoad?: boolean
  imageClassName?: string
  imageStyle?: React.CSSProperties
  quality?: number
  sizes?: string
  loading?: 'lazy' | 'eager'
  renderWrapper?: ({
    children: React.ReactNode
    width?: number
    height?: number
  }) => React.ReactElement
  useNativeLazyLoading?: boolean
  useWebP?: boolean
  placeholder?: (props: {
    aspectRatio?: number
    maxWidth?: number
    isDarkColorMode?: boolean
    isAdmin: boolean
  }) => string
}

// For editable images
interface EditableImage extends SharedImageProps {
  readonly?: false
  propName?: string
  metaFieldName?: 'image'
  customFieldName?: string
  aspectRatio?: number
  maxWidth?: number
}

// For readonly images
interface ReadOnlyImage extends SharedImageProps {
  readonly: true
  source: types.IImageSource
}

/**
 * Props for Image
 */
type ImageProps = EditableImage | ReadOnlyImage

Properties definition
Property	Definition
propName	The prop of the Brick component corresponding to this image.
source	The value of the prop for this image. Required for Server Components, but always recommended for RSC compatibility
alt	The fallback alternate text for the image when not provided via the upload modal
maxWidth	The maximum width in pixel at which your image will be displayed. Used to calculate the responsive images for normal and retina displays. Default value is 800.
noLazyLoad	Set to true to avoid lazy loading. Default is false.
aspectRatio	If set, provides a fixed-ratio selection mask to crop the uploaded image.
imageClassName	Optional className to apply to the <img> tag.
imageStyle	Optional style object to apply to the <img> tag.
sizes	Optional string to set the sizes attribute on the image for responsive images serving.
loading	Optional prop to change the loading attribute for native lazy loading. Default is lazy. Usually, the default behaviour suffices.
renderWrapper	Optional render function for a custom wrapper around the image. Provides children, width and height as arguments (width and height are from the original image size, useful for calculating aspect ratio).
useNativeLazyLoading	The default is true: if browser support for native lazy loading is detected, it is used instead of our lazy loading system. Set to false to always use the custom lazy loading.
useWebP	The default is true: creates WebP images upon upload, keeping JPEG (or PNG for transparency) as fallbacks without WebP support. Set to false to skip WebP creation.
metaFieldName	Binds the image value to a page Meta field (two-way data binding)
customFieldName	Bind the image value to a page Custom field (two-way data binding)
placeholder	Function to customize the default image placeholder. Receives { aspectRatio, maxWidth, isDarkColorMode, isAdmin } and should return a string URL. For custom placeholders, explicitly avoid rendering if isAdmin is false to prevent frontend display.
readonly	Default is false. If true, the image is read-only, without an editing interface.
quality	Quality of the optimized image (applied to WebP and JPEG images). Default is 80.
DEPRECATED	The following properties still work but are deprecated
containerClassName	Optional className for the image container (a thin wrapper created by React Bricks).
DEPRECATED since 3.3.0 as no wrapper is created anymore. Use renderWrapper instead.
containerStyle	Optional style object to apply to the image container.
DEPRECATED since 3.3.0 as no wrapper is created anymore: use renderWrapper instead.
noWrapper	Optional flag to avoid the wrapping <div> around the image. Default is false.
DEPRECATED since 3.3.0 as no wrapper is created anymore.
Usage with Server Components
When working with Server Components, you need to import from 'react-bricks/rsc':

import { types, Image } from 'react-bricks/rsc'
Repeater
React Bricks allows for infinite nesting of bricks within bricks using the <Repeater> component.

Each Repeater can contain either a single repeatable brick type or multiple types.

Usage example
Let’s consider the following “Button” brick that we want to repeat inside a “TextImage” brick:

Button.tsx
import { types, Link, Text } from 'react-bricks/frontend'
import clsx from 'clsx'

export interface ButtonProps {
  path: string
  buttonText: types.TextValue
}

const Button: types.Brick<ButtonProps> = ({ path, buttonText }) => (
  <div>
    <Link
      href={path}
      className="inline-block text-center font-semibold leading-6 rounded-full px-8 py-3 border text-white bg-indigo-500 hover:bg-indigo-500/90 transition-colors border-indigo-500"
    >
      <Text
        propName="buttonText"
        value={buttonText}
        placeholder="Type a buttonText..."
        renderBlock={({ children }) => <span>{children}</span>}
      />
    </Link>
  </div>
)

Button.schema = {
  name: 'my-button',
  label: 'Button',
  hideFromAddMenu: true,
  getDefaultProps: () => ({
    buttonText: 'Learn more',
  }),
  sideEditProps: [
    { name: 'path', label: 'Path', type: types.SideEditPropType.Text },
  ],
}

export default Button

In our TextImage brick, we need to:

Add a prop in our interface for the repeated buttons
Add a <Repeater> component in the rendered JSX where items should appear
Add the repeaterProps in the brick’s schema to specify the type of brick to be repeated
1. Add a prop in the brick interface:
TextImage.tsx
interface TextImageProps {
  title: types.TextValue
  description: types.TextValue
  image: types.IImageSource
  buttons: types.RepeaterItems<ButtonProps>
}

2. Add the Repeater component:
TextImage.tsx
// ...
<Repeater
  propName="buttons"
  items={buttons}
  renderWrapper={(items) => (
    <div className="flex gap-4 flex-wrap mt-6">{items}</div>
  )}
/>
// ...

3. Add repeaterItems in the schema
TextImage.tsx
TextImage.schema = {
  name: 'text-image',
  label: 'Text Image',
  ...
  repeaterItems: [
    {
      name: 'buttons',
      itemType: 'my-button',
      itemLabel: 'Button',
      max: 2,
    },
  ],
  ...
}

Note that the name buttons is the same for both the Repeater’s propName and the item name in the repeaterItems.

In this example, our Repeater allows only one type of brick to be repeated (my-button). By setting max: 2, we limit the number of buttons that can be added in the repeater.

Tip

It’s advisable for the repeated brick to have a root div element. This allows React Bricks to properly attach focus events to the element.

Repeater Properties
interface RepeaterProps {
  propName: string
  items?: types.RepeaterItems<T>
  itemProps?: types.Props
  renderWrapper?: (items: React.ReactElement) => React.ReactElement
  renderItemWrapper?: (
    item: React.ReactElement,
    index?: number,
    itemsCount?: number
  ) => React.ReactElement
}

Repeater Properties definition
Property	Definition
propName	Name of the prop containing the repeated items (should match the one in the repeaterItems schema property)
items	The value of the prop for this repeater, containing the repeated items. Required for Server Components, but always recommended for RSC compatibility
itemProps?	Optional object with props passed to all the items (e.g., a global configuration shared by all the items).
renderWrapper?	Optional function taking items as an argument. It should return JSX that wraps the items. Rendered only if there is at least one repeated item.
renderItemWrapper?	Optional wrapper around each item. Takes item, index and itemsCount as arguments and should return JSX
The schema’s repeaterItems Property
While there’s a dedicated section in the docs about the bricks’ schema, we’ll include the interface for repeaterItems here due to its close relation to the Repeater component.

repeaterItems?: IRepeaterItem[]

Where IRepeaterItem is defined as:

interface IRepeaterItem {
  name: string
  label?: string
  itemType?: string
  itemLabel?: string
  defaultOpen?: boolean
  min?: number
  max?: number
  positionLabel?: string // DEPRECATED => use "label"
  getDefaultProps?: () => Props
  items?: {
    type: string
    label?: string
    min?: number
    max?: number
    getDefaultProps?: () => Props
  }[]
}

When max is reached, no more blocks can be added to the repeater.
Setting a min ensures that React Bricks always maintains at least that number of blocks (adding items with default values).

RepeaterItem Properties definition
Property	Definition
name	Name of the prop containing the repeated items (e.g., “buttons”)
itemType	Corresponds to the unique name of the repeated Brick type (e.g., “my-button”)
label?	Label for the group of items in this repeater (title of nested items)
itemLabel?	Optional label used for the Add / Remove buttons. If not provided, the repeated brick’s label is used as a fallback
min	Minimum number of repeated items allowed
max	Maximum number of repeated items allowed
getDefaultProps	Function that returns the default props for the repeated brick inside of this brick. For example, for a Button brick repeated inside a Form brick, you could specify that the default type should be “submit” instead of “link”.
items	Allowed item types, when multiple. In this case the main itemType and min are not considered. Each item has its own type, label, min, max and getDefaultProps.
Multiple item types
itemType is used for a single type of brick that can be repeated in a Repeater (e.g. a Thumbnail in a Gallery).
items is used for multiple types of brick in a Reapear (e.g., in a Form you may add “TextInput” blocks or “Select” blocks).
With multiple item types, each with its own min and max, the root item’s min is ignored, while the overall max is still enforced.
Hiding a Repeated Brick from the Brick Selection
Sometimes a brick is designed to be used only within another brick, and you don’t want editors to add it directly to a page as a standalone element. For example, you might have a GalleryImage brick that should only appear inside a Gallery brick.

To prevent such a brick from showing up in the list of available bricks when adding a new block, set hideFromAddMenu: true in the brick’s Schema.

Usage with Server components
When working with Server Components, you need to import from 'react-bricks/rsc':

import { types, Repeater, Text } from 'react-bricks/rsc'

see more in the Server Components documentation.

The Link component
The Link component simplifies the management of links, both standalone and within RichText fields.

When you enable Links in a RichText without customizing the render function, a Link component is automatically used to render links.

Link Component vs. Standard Anchor
The Link component utilizes the framework’s Link (e.g., Next.js Link) for local paths, while rendering a standard <a> tag for absolute URLs
In the Editor interface, the Link component doesn’t trigger a link when clicked, allowing easy text editing within a link using a <Text> component.
Standalone Usage Example
Button.tsx
import { Text, Link, types } from 'react-bricks/frontend'

interface ButtonProps {
  buttonText: types.TextValue
  buttonPath: string
}

const Button: types.Brick<ButtonProps> = ({ buttonText, buttonPath }) => {
  return (
    <Link
      href={buttonPath}
      className="py-2 px-6 text-white text-center bg-sky-500"
    >
      <Text
        propName="buttonText"
        value={buttonText}
        placeholder="Action"
        renderBlock={({ children }) => <span>{children}</span>}
      />
    </Link>
  )
}

Button.schema = {
  name: 'button',
  label: 'Button',

  getDefaultProps: () => ({
    buttonText: 'Learn more',
  }),

  sideEditProps: [
    {
      name: 'buttonPath',
      label: 'Path or URL',
      type: types.SideEditPropType.Text,
      validate: (value) =>
        value?.startsWith('/') ||
        value?.startsWith('https://') ||
        'Please, enter a valid URL',
    },
  ],
}

export default Button

Usage inside a RichText
import { Link } from 'react-bricks/frontend'

// ...
<RichText
  propName="description"
  value={description}
  renderBlock={({ children }) => (
    <p className="text-lg text-gray-500">{children}</p>
  )}
  placeholder="Type a description"
  allowedFeatures={[types.RichTextFeatures.Link]}
  renderLink={({ children, href, target, rel }) => (
    <Link
      href={href}
      target={target}
      rel={rel}
      className="text-sky-500 hover:text-sky-600 transition-colors"
    >
      {children}
    </Link>
  )}
/>

When editors opt to open a link in a new tab through the link popup interface, the attributes target="_blank" and rel="noopener" are automatically applied.

Properties
interface LinkProps {
  href: string
  target?: string
  rel?: string
  className?: string
}

Properties Definition
Property	Definition
href	The URL for an external link or the local path for a local link.
target	The target for the external link (for example “_blank”).
rel	The “rel” for the external link (for example “noopener”).
className	CSS class to be applied to the link tag.
The Link component also spreads {...rest} properties on the link tag or framework’s Link component.

Usage with Server Components
When working with Server Components, you need to import from 'react-bricks/rsc':

import { types, Link, RichText } from 'react-bricks/rsc'


File
The File component enables content creators to upload files. This feature is particularly useful when you need to include downloadable documents on your page, such as PDF catalogs or terms and conditions. You can specify which file extensions are allowed for each File component.

Usage Example
import { File } from 'react-bricks/frontend'
...

<File
  propName="catalog"
  allowedExtensions={['.pdf']}
  renderBlock={({ name, url, size }) => (
    <a href={url}>
      {name}, {size / 1024} KB
    </a>
  )}
/>

The JSX returned by the render function is displayed on both the frontend and the Editor interface. In the editor, content creators can upload a file by clicking on the rendered JSX. They can also remove a file or provide an SEO-friendly name (enforced via rewrite rules).

You can render different elements on the frontend and admin interface by checking the isAdmin flag.

Properties
Here’s the TypeScript interface for the props of the File component:

interface FileProps {
  propName: string
  source?: types.IFileSource
  renderBlock: (props: types.IFileSource) => JSX.Element
  allowedExtensions?: string[]
}

interface IFileSource {
  name: string // file name
  url: string
  size: number // size in bytes
}

Properties definition
Property	Definition
propName	The prop corresponding to this file.
renderBlock	Render function to render the document on the page. Its argument is an object with name (file name), url, and size (file size in bytes).
allowedExtensions	Array of strings representing the allowed extensions.
Allowed extensions
Allowed extensions must be a subset of the following: .pdf, .bmp, .gif, .jpg, .jpeg, .png, .svg, .tif, .tiff, .webp, .mp4, .txt, .rtf.

Extensions not listed above are not allowed, even if specified in the allowedExtensions array.

Icon
The Icon component isn’t really a visual editing component—rather, it renders an SVG icon that users choose through a sidebar IconSelector control.

The component accepts an icon prop of type Icon, matching what’s returned by an IconSelector sidebar control. By rendering an inline <svg>, it offers both performance (avoiding GET requests) and flexibility. You can customize it with any className, width, height, or other SVG props, and even preprocess the file before rendering.

Usage Example
// Import from 'react-bricks/rsc/client' for Server components
import { Icon } from 'react-bricks/frontend'
...

<Icon
  icon={icon}
  width={32}
  height={32}
  className="text-pink-500 hover:text-pink-700"
  title="My Icon"
  description="Description for my Icon"
  fillOpacity={0.5}
/>

Properties
Here’s the (simplified) TypeScript interface for the props of the Icon component, which inherits all the props of a normal SVG, like className, width, height, etc.:

interface IconProps extends React.SVGProps<SVGElement> {
  icon: types.Icon
  description?: string
  preProcessor?: (code: string) => string
  title?: string | null
}

Properties definition
Property	Definition
icon	The icon object of type Icon, typically set by a sideEditProp of type IconSelector.
description	Optional description. It will override an existing <desc> tag
preProcessor	A function to process the contents of the SVG text before parsing.
title	Optional title. It will override an existing <title> tag. If null is passed, the <title> tag will be removed.
Preprocessor example
Here’s an example of using preProcessor to process the SVG content.

preProcessor={(code) => code.replace(/fill=".*?"/g, 'fill="currentColor"')}

In case of icons from an IconSelector the previous code would not be needed, as icons have already fill="currentColor" for any path.

Schema
Each brick requires a schema property, which defines the brick name, default props, sidebar controls and other things.

Required props
Th required props are just two:

name: a name for this brick. It must be unique within the bricks configured for an App
label: the name displayed for this brick in the editing interface
Let’s see a first simple example of a brick’s schema:

Usage Example
TextImage.tsx
const TextImage: types.Brick<TextImageProps> = ({...}) => {
  return (
    ...
  )
}

TextImage.schema = {
  name: 'text-image',
  label: 'Text Image',
  previewImageUrl: imgPreview.src,
  getDefaultProps: () => ({
    title: 'Thick as a brick',
    description: 'Another brick in the wall',
    imageSide: 'right',
  }),
  sideEditProps: [
    {
      name: 'imageSide',
      label: 'Image Side',
      type: types.SideEditPropType.Select,
      selectOptions: {
        display: types.OptionsDisplay.Radio,
        options: [
          { value: 'left', label: 'Left' },
          { value: 'right', label: 'Right' },
        ],
      },
    },
  ],
}

Schema Properties
Let’s analyze the schema properties dividing them in 3 groups:

1. Key Properties
Apart from name and label, there are other key properties defined in the schema.

Click on the property to access the dedicated page in the documentation:

`getDefaultProps`
A function returning the default props for this brick, when it is added to a page.
`sideEditProps`
Array of sidebar controls to let the editors adjust props. Controls can also be organized in collapsible groups.
`repeaterItems`
Used in conjunction with a `Repeater` to define the type of brick to be repeated.
`stories`
Stories are a way to reuse a brick's configuration. They can be defined in code or saved by content editors.
`getExternalData` and `mapExternalDataToProps`
Directly fetch data from an external data source in a brick or map data from the Page Type to props of this brick
`astroInteractivity`
For Astro, specify the type of client interactivity (by default no JavaScript is sent to the client).
2. UI and Categorization
Property	Description
hideFromAddMenu	Hide this brick from the “Add new brick” menu. Useful to prevent editors to add directly to a page bricks that are meant to be used only when repeated within another brick.
previewImageUrl	Image of the brick shown in the “Add new brick” selection on the right sidebar.
tags	A set of tags to help content editors find this brick with the search function (for example, add “cta”, “call to action”, “link” to a “CallToAction” brick)
playgroundLinkUrl	Show a link in the Playground for this brick: for example to an external design guideline.
playgroundLinkLabel	Label for the Playground link.
Typings for Schema
Schema interface
interface IBlockType<T = Props> {
  name: string
  label: string
  getDefaultProps?: () => Partial<T>
  hideFromAddMenu?: boolean
  sideEditProps?: Array<ISideEditProp<T> | ISideGroup<T>>
  repeaterItems?: IRepeaterItem[]
  newItemMenuOpen?: boolean
  groupByRepeater?: boolean
  getExternalData?: (
    page: Page,
    brickProps?: T,
    args?: any
  ) => Promise<Partial<T>>
  mapExternalDataToProps?: (externalData: Props, brickProps?: T) => Partial<T>
  playgroundLinkUrl?: string
  playgroundLinkLabel?: string
  theme?: string
  category?: string
  tags?: string[]
  previewImageUrl?: string
  previewIcon?: React.ReactElement
  stories?: BrickStory<Partial<T>>[]
}

Note

The ISideEditProp / ISideGroup interface is explained in the Side edit props page.
The IRepeaterItem interface is explained in the Repeater page.
The BrickStory type is explained in the Stories page.
Properties definition
Property	Definition
name	The unique name for this block type (for example “hero-unit”). The “RB_PAGE_EMBED” name is reserved and should be used only for an embed brick.
label	The name displayed in the Sidebar when you want to add a new block (for example “Hero Unit”).
getDefaultProps	A function returning the default props for new added blocks.
hideFromAddMenu	If true, the component isn’t shown in the list of components available in the “add block” menu. For example, you may want to hide a block that can be used only inside of a <Repeater />.
sideEditProps	The array of objects representing the props the user will be able to modify in the right Sidebar, with their display properties. See Side Edit Props.
repeaterItems	Array to specify behaviour of the bricks used in the <Repeater> components. See Repeater.
newItemMenuOpen	If true the “Add new…” accordion menu is open by default; if false it is closed by default; otherwise, by default it is open when the number of repeaterItems is less than or equal to 4 and closed otherwise.
groupByRepeater	false by default. If set to true the items that can be repeated are grouped by repeater (if you set the positionLabel the title of each collapsible section is the positionLabel).
getExternalData	Function to fetch external data. It has the page, the brick’s props and a third argument as arguments and should return (async) an object which is merged to the brick’s props. See External content.
mapExternalDataToProps	Function that gets as first argument the external data (from the getExternalData function specified on the pageType) and as second argument the props on this brick. It should return the new props for this brick. See External content.
playgroundLinkUrl	Url to link in the Playground, for example to link docs, guidelines, etc.
playgroundLinkLabel	Text for the link in the Playground, for example to link docs, guidelines, etc.
category	Used to categorize bricks. Bricks will be shown grouped by category.
tags	Tags are used to search bricks in the Admin interface.
previewImageUrl	Image URL to be used as preview image for this brick. You can create easily a “screenshot image” of a brick from the Playground. It is shown only if you set the enablePreviewImage flag to true in the React Bricks configuration.
stories	You may define default stories on a brick. Editors will be able to add their own stories saved on the React Bricks APIs. This feature is available only for “Pro” and upper plans. See Stories and the BrickStory type

Default Props
The getDefaultProps function defines the default props to be applied when a brick instance is added to a page. It should return an object containing these props.

By passing your brick’s props to the types.Brick<T> generic, you ensure that the object returned by getDefaultProps is fully typed.

Usage Example
MyBrick.schema = {
  // ...
  getDefaultProps: () => ({
    imageSide: 'right',
    title: 'This is the default title',
    faqs: [
      {
        question: 'Which came first, the chicken or the egg?',
        answer:
          "It depends on how you define a chicken's egg. At some point in evolutionary history when there were no chickens yet, two birds that were almost-but-not-quite chickens mated and laid an egg that hatched into the first chicken. If a chicken's egg is defined as 'an egg laid by a chicken', then the chicken came first; if it is defined as 'an egg that a chicken hatches from', then the egg came first.",
      },
    ],
  }),
}

Sidebar controls
Sidebar controls offer content editors controlled flexibility by allowing them to set properties for a brick. These properties are typically used in the component’s JSX to apply CSS rules conditionally. This enables editors to modify elements like background color, title size, or padding values.

sideEditProps
Sidebar controls are defined in the schema’s sideEditProps property.

This property contains an array of sidebar controls. When there are many controls, it can also include an array of collapsible groups for better organization. Each group contains its own array of controls.

Each “sideEditProp” has:

A name that matches the prop set on the React component
A label for the user interface
A type that defines the type of control that the content editors will use to set the corresponding prop (e.g., select, text, range)
Optional helper text, validation rules and conditional rendering
Additional properties specific to the control type
Usage Example
MyBrick.schema = {
  ...
  sideEditProps: [
    {
      name: 'withImage',
      label: 'With Image',
      type: types.SideEditPropType.Boolean,
    },
    {
      name: 'imageSide',
      label: 'Image Side',
      type: types.SideEditPropType.Select,
      selectOptions: {
        display: types.OptionsDisplay.Radio,
        options: [
          { value: 'left', label: 'Left' },
          { value: 'right', label: 'Right' },
        ],
      },
      // Show only if `withImage` is true
      show: (props) => props.withImage
    },
    {
      name: 'url',
      label: 'Url',
      type: types.SideEditPropType.Text,
      // Validate URL
      validate: (value) => value.startsWith('https://') || 'Invalid URL'
    },
  ],
...
}

Properties
Here is the Typescript interface for each side-edit prop:

interface ISideEditProp {
  name: string
  label: string
  type: SideEditPropType
  component?: React.FC<ICustomKnobProps>
  validate?: (value: any, props?: Props) => boolean | string
  show?: (props: Props, page: Page, user: User) => boolean
  helperText?: string
  shouldRefreshStyles?: boolean
  textareaOptions?: {
    height?: number
  }
  imageOptions?: {
    maxWidth?: number
    quality?: number // default 80
    aspectRatio?: number
  }
  rangeOptions?: {
    min?: number
    max?: number
    step?: number
  }
  selectOptions?: {
    options?: IOption[]
    getOptions?: (props: Props) => IOption[] | Promise<IOption[]>
    display: OptionsDisplay
  }
  autocompleteOptions?: {
    getOptions: (input: string, props: Props) => any[] | Promise<any[]>
    getKey: (option: any) => string | number
    getLabel: (option: any) => string
    renderOption?: ({
      option,
      selected,
      focus,
    }: {
      option: any
      selected: boolean
      focus: boolean
    }) => React.ReactElement
    placeholder?: string
    debounceTime?: number
    getNoOptionsMessage?: (input?: string) => string
  }
  iconSelectorOptions?: {
    iconSets?: IconSets[]
  }
  relationshipOptions?: {
    references: string
    multiple: boolean
    label?: string
    embedValues?: boolean
  }
}

Where SideEditPropType is defined as follows:

enum SideEditPropType {
  Text = 'TEXT',
  Textarea = 'TEXTAREA',
  Number = 'NUMBER',
  Date = 'DATE',
  Range = 'RANGE',
  Boolean = 'BOOLEAN',
  Select = 'SELECT',
  Autocomplete = 'AUTOCOMPLETE',
  Image = 'IMAGE',
  Custom = 'CUSTOM',
  Relationship = 'RELATIONSHIP',
  IconSelector = 'ICON-SELECTOR',
}

and IconSets is defined as follows:

enum IconSets {
  HeroIconSolid = 'hi-solid',
  HeroIconOutline = 'hi-outline',
  FontAwesome = 'fa6',
  Feather = 'fi',
}

Properties definition
Property	Definition
name	The name of the prop passed to the component.
label	The label displayed in the edit sidebar.
type	One of the following:SideEditPropType.Text, SideEditPropType.Number, SideEditPropType.Date, SideEditPropType.Range, SideEditPropType.Boolean, SideEditPropType.Select, SideEditPropType.Autocomplete, SideEditPropType.Image, SideEditPropType.Custom (see SideEditPropType).

The IMAGE type is useful for images edited in the sidebar, like background images.

The CUSTOM type allows you to provide your own sidebar component.
component	Optional. Required for SideEditPropType.Custom type. Provide a custom React functional component with props value, onChange, and isValid to edit this prop.
validate	Validation function that receives the value as the first argument and all props as the second argument (object with key-value pairs). It should return true for valid, false for invalid, or a string for an invalid state with an error message.
show	Function that determines whether to display the editing control. It receives props, current page, and logged-in user. Useful for conditional display based on other props or user roles.
shouldRefreshStyles	Set totrueif changing this value could trigger new style injections by a CSS-in-JS library, ensuring correct loading of new styles.
helperText	Optional text diplayed below the control to guide the user.
textareaOptions	Specify the height for a textarea field.
imageOptions	For SideEditPropType.Image props, specify the maxWidth (the optimization algorithm uses 2x this for retina displays) and desired aspectRatio for cropping.
rangeOptions	For SideEditPropType.Number and SideEditPropType.Range props, specify the min, max and step values.
selectOptions	For SideEditPropType.Select props, specify:

1. options: Array of options with value (passed to the React component) and label (shown in the Sidebar).
See the IOption interface.

2. getOptions: function returning options or a promise resolving to options. It receives the brick current props. Use for dynamic options, for example from API calls. Alternative to options

3. display: one of types.OptionsDisplay.Select (dropdown), types.OptionsDisplay.Radio (radio buttons), or types.OptionsDisplay.Color (colored circles). For colors, the value should be an object with a color prop, and any other needed props.
See OptionsDisplay
autocompleteOptions	For SideEditPropType.Autocomplete props, specify:

1. getOptions: Async function receiving search input and brick props, returning an array of option objects.

2. getKey: Function returning a unique key for an option object

3. getLabel: Function returning the label for an option in the dropdown and for the selected option.

4. renderOption: Function returning JSX for the dropdown menu, overriding getLabel for the dropdown menu (getLabel is still used to display the selected option)

5. placeholder: Input placeholder text

6. debounceTime: debounce time for the async function in milliseconds (default: 350ms).

7. getNoOptionsMessage: Function receiving the input value, returning a message when no options are found.
iconSelectorOptions	For SideEditPropType.IconSelector props, optional. Specify an array of iconSets that should be returned in the search results, where the values are of type IconSets. If not provided, all icon sets are available.
relationshipOptions	For SideEditPropType.Relationship props, specify:

1. label: The label.

2. references: Name of the referenced pageType (e.g., “category” for a product).

3. multiple: If true, allows multiple selections (many-to-many); if false, single selection (one-to-many).

4. embedValues: If true, includes all values for the related entity in a prop named {name}_embed; default is false (only ID of related entity).
Validation
You can validate user input for each sidebar control by providing a validate function

This function receives two arguments: the control’s value and an object containing all props.

It should return one of the following:

true: The value is valid
false: The value is invalid. No error message is provided, but the control will display a red border to indicate the error.
A string: the value is invalid. The value is invalid. The string serves as an error message displayed to the user.
Preventing Saves with Validation Errors
When any brick control on the page has a validation error, a tooltip appears on the “Save” button. This tooltip informs the editor that at least one error exists.

To enhance error prevention, you can set the disableSaveIfInvalidProps property to true in the React Bricks configuration. This setting prevents saving if any errors are present on the page.

Conditional rendering of controls
You can conditionally display a sidebar control by providing a show function. This function receives props, the current page, and the logged-in user as arguments.

This feature is useful for showing controls based on other controls’ values (e.g., displaying an image side prop only when an image exists) or user properties (such as hiding a control for specific users or roles).

Collapsible groups
Sidebar controls can be organized into collapsible groups for better organization.

A collapsible group is defined by this interface:

interface ISideGroup {
  groupName: string
  defaultOpen?: boolean
  show?: (props: Props) => boolean
  props: ISideEditProp[]
}

The interface properties are:

groupName: The group’s label. Clicking it toggles the expansion of the control group.
defaultOpen: Specifies whether the group is initially expanded (defaults to false).
show: A function determining the group’s visibility based on component props.
props: An array of ISideEditProp objects defining the group’s controls.
Control types
Let’s examine each type of available control in more detail.

Simple types
Some simple types require no additional configuration. These include Text, Date, and Boolean.

Select
Use this control type when you want content editors to choose one value from multiple options.

You can present the options as a drop-down menu, a set of radio buttons, or multiple colored circles for color selection. Values can be provided statically with options or dynamically through an async function call (getOptions) that resolves to the options array.

To configure the select control, use the selectOptions object with the following properties:

options: An array of options, each with a value (passed to the React component) and a label (displayed in the Sidebar). Refer to the IOption interface for details.
getOptions: A function that returns options or a promise resolving to options. It receives the brick’s current props. Use this for dynamic options, such as those from API calls. This is an alternative to options.
display: Choose from types.OptionsDisplay.Select (dropdown), types.OptionsDisplay.Radio (radio buttons), or types.OptionsDisplay.Color (colored circles). For colors, the value should be an object with a color prop and any other necessary props. See OptionsDisplay for more information.
Autocomplete
Use this control type when you want content editors to choose one value from multiple options returned by an async function call to external APIs. The options depend on the user’s input, providing search-like functionality.

To configure the autocomplete control, use the autocompleteOptions object with the following properties:

getOptions: An async function that receives search input and brick props, returning an array of option objects.
getKey: A function returning a unique key for an option object.
getLabel: A function returning the label for an option in the dropdown and for the selected option.
renderOption: A function returning JSX for the dropdown menu items, overriding getLabel for the menu (note: getLabel is still used to display the selected option).
placeholder: The input placeholder text.
debounceTime: The debounce time for the async function in milliseconds (default: 350ms).
getNoOptionsMessage: A function receiving the input value and returning a message when no options are found for the current input.
Image
Use this control type for images that can’t be edited visually by clicking on the content, such as background images.

To configure the image control, use the imageOptions object with the following properties:

maxWidth: The optimization algorithm uses twice this width as the maximum dimension for retina displays.
aspectRatio: Sets a fixed aspect ratio for cropping (e.g. 16 / 9).
Number and Range
For Number and Range controls, you can specify rangeOptions. This object allows you to set the min (minimum), max (maximum), and step values. These parameters define the control’s range and increment.

Textarea
For Textarea controls, you can specify textareaOptions. This object has a single property, height, which allows you to set the desired height for the field.

Icon Selector
Content editors often need to choose an icon from a set, searching by keywords. The IconSelector control type is ideal for this scenario. It provides an autocomplete control that connects to our advanced icon search service, allowing semantic searches for icons from popular libraries such as HeroIcons, Feather icons, and FontAwesome.

In the iconSelectorOptions, you can specify iconSets, an array of types.IconSets that should be available in the search results. If not specified, all icon sets will be available.

The prop value is of type types.Icon. Pass it to the Icon component to render an inline SVG that allows customizing props like width, height, and className.

Relationship
Use this control when you want editors to choose a page of a specific pageType, establishing a relationship between the current brick and a page or entity.

This is particularly useful when you need to render custom field values of a related entity (for instance, the name of a product’s related category).

In the relationshipOptions, specify:

label: The label for the select control
references: Name of the referenced pageType (e.g., “category” for a product).
multiple: Set to true for multiple selections (many-to-many), or false for single selection (one-to-many).
embedValues: When true, includes all values for the related entity in a prop named {name}_embed. Defaults to false, providing only the ID of the related entity.
Custom Components
You can provide your own editing component for a sideEditProp (for example, a small map for latitude and longitude selection). In this case, set the type of control to types.sideEditPropType.Custom.

Provide your own React functional component in the component property. This component will receive the following props:

value: The current value of the prop.
onChange: A function that accepts a new value as an argument to update the prop.
isValid: A boolean indicating whether the prop matches the validation rules, allowing you to apply styles for invalid states.

Repeater Items
When you need to repeat bricks inside another brick, creating a nested structure, you use a Repeater component.

To let React Bricks know which brick (or bricks) should be repeated inside a Repeater, add the repeaterItems array to the brick’s schema.

Usage Example
MyBrick.schema = {
  ...
  repeaterItems: [
    {
      name: 'socialProof',
      itemType: 'customer-logo',
      itemLabel: 'Logo',
      max: 12,
    },
  ],
}

Properties
Here’s the TypeScript interface for repeaterItems:

repeaterItems?: IRepeaterItem[]

Where IRepeaterItem is defined as:

interface IRepeaterItem {
  name: string
  label?: string
  itemType?: string
  itemLabel?: string
  defaultOpen?: boolean
  min?: number
  max?: number
  positionLabel?: string // DEPRECATED => use "label"
  getDefaultProps?: () => Props
  items?: {
    type: string
    label?: string
    min?: number
    max?: number
    getDefaultProps?: () => Props
  }[]
}

Properties Definition
Property	Definition
name	Name of the prop containing the repeated items (e.g., “buttons”)
itemType	Corresponds to the unique name of the repeated Brick type (e.g., “my-button”)
label?	Label for the group of items in this repeater (title of nested items)
itemLabel?	Optional label for Add / Remove buttons. If not provided, the repeated brick’s label is used as a fallback
min	Minimum number of repeated items allowed. React Bricks ensures at least this number of blocks (adding items with default values)
max	Maximum number of repeated items allowed. When reached, no more blocks can be added to the repeater
getDefaultProps	Function returning default props for the repeated bricks. For example, for a Button brick repeated inside a Form brick, you could specify that the default type should be “submit” instead of “link”.
items	Allowed item types, when multiple. In this case the main itemType and min are ignored. Each item has its own type, label, min, max and getDefaultProps.
Multiple item types
itemType is used for a single type of brick that can be repeated in a Repeater (e.g. a Thumbnail in a Gallery).
items is used for multiple types of brick in a Reapear (e.g., in a Form you may add “TextInput” blocks or “Select” blocks).
With multiple item types, each with its own min and max, the root item’s min is ignored, while the overall max is still enforced.

Stories
Stories, along with Embed, offer a way to re-use content across pages.

While embedding a page within another provides a “single source of truth” (changes to an embedded page affect all pages embedding it), a “story” acts more like a template for bricks.

A story is a named set of props for a brick. When you apply a story to a brick, you’re applying these saved props. After application, the brick can be modified independently, without maintaining any connection to its original story.

How to create a story
Stories can be created in two ways:

From the editor: Using the “Stories” tab when a block is selected. These stories are saved to the React Bricks database and retrieved via APIs by the editor interface.

In code: By the developer, using the stories array in the brick’s schema. These stories reside in your design system’s code.

Stories saved from the Editor interface
Here’s’ how content editors can save stories for a brick from the editor interface:

Stories set in code
In the brick’s schema, you can define an array of stories using the stories property. You can also specify whether a story appears as a normal brick in the “Add new brick” menu by setting the story’s showAsBrick flag to true.

Example usage
HeroUnit.schema = {
  ...
  stories: [
    {
      id: 'black-friday-cta',
      name: 'CTA for Black Friday',
      props: {
        title: 'Black friday discount',
        background: { color: '#000', className: 'bg-black' }
      },
      showAsBrick: true
    },
  ],
}

Properties
Each element has the following TypeScript interface (the generic type is inherited from the brick’s component interface):

type BrickStory<T = Props> = {
  id: string
  name: string
  showAsBrick?: boolean
  previewImageUrl?: string
  props: T
}

Properties definition
Property	Definition
id	Unique identifier for this story.
name	Name for the story displayed in the editor.
showAsBrick	If true, the story appears as a new brick in the “Add new brick” interface, making it directly selectable. Default: false.
previewImageUrl	Preview image for this story (required only if showAsBrick is true).
props	The object containing the props to be applied by this story.

Connect external APIs
In a brick, you can fetch data from external APIs and make it available on the brick’s props.

To achieve this, define the getExternalData function on the brick’s schema. This function receives the current page, all the brick’s props, and additional arguments that can be passed when calling the fetchPage function.

It should be an async function that fetches data from external APIs and returns a promise resolving to an object. This object is then merged with the brick’s props, making the external API data available for use within the brick.

Note

You can fetch external data getting params from on a brick’s prop, a page meta value like the slug, or a page custom field.

Usage Examples
Fetch based on a Page custom field
Product.tsx
...
Product.schema = {
  ...
  getExternalData: async (page, brickProps) => {
    const res = await fetch(`https://externalapi/products/${page.customValues.productId}`)
    const product = await res.json()
    return ({
      productName: product.name
      productImage: product.imageUrl
    })
  }
}

Fetchs based on a brick’s prop
StockQuote
import { types } from 'react-bricks/rsc'
import classNames from 'classnames'

interface StockQuoteProps {
  symbol: string
  stockResult: {
    c: number
    d: number
    dp: number
    h: number
    l: number
  }
}

const StockQuote: types.Brick<StockQuoteProps> = ({ symbol, stockResult }) => {
  if (!stockResult) {
    return (
      <div className="text-center text-red-500 underline text-xl">
        Symbol not found!
      </div>
    )
  }

  const { c, d, dp, h, l } = stockResult

  return (
    <div className="my-12 w-52 mx-auto rounded-full border px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="text-black font-bold">{symbol}</div>
        <div className="text-black font-bold">{c?.toFixed(2)}</div>
      </div>
      <div className="flex items-center justify-between">
        <div
          className={classNames(
            'text-sm font-bold',
            dp >= 0 ? 'text-green-500' : 'text-red-500'
          )}
        >
          {dp?.toFixed(2)}%
        </div>
        <div>
          <input
            type="range"
            readOnly
            min={l}
            max={h}
            value={c}
            className="w-24 h-1 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2
            [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500"
          />
        </div>
      </div>
    </div>
  )
}

StockQuote.schema = {
  name: 'stock-quote',
  label: 'Stock Quote',

  getExternalData: async (page, brickProps) => {
    const response = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${brickProps?.symbol}&token=<Your_FinnHub_Token>`,
      { next: { revalidate: 10 } }
    )
    const data = await response.json()

    return {
      stockResult: {
        c: data.c,
        d: data.d,
        dp: data.dp,
        l: data.l,
        h: data.h,
      },
    } as Partial<StockQuoteProps>
  },

  sideEditProps: [
    {
      name: 'symbol',
      label: 'Symbol',
      type: types.SideEditPropType.Text,
    },
  ],
}

export default StockQuote

Result
TypeScript signature
getExternalData?: (
  page: Page,
  brickProps?: T,
  args?: any
) => Promise<Partial<T>>

Arguments
Property	Definition
page	The page object for the current page.
brickProps	The props for this brick. The generic type is inherited from the brick’s interface.
args	Arguments that can be passed from the fetchPage, for example to receive a querystring parameter.
Return value
A promise resolving to an object of type Partial<T>, where T is the brick component’s interface. This returned object is merged with the brick’s props.

Use data fetched at Page level
If you defined the getExternalData on the pageType, rather than on the brick’s schema, you can map the external data fetched at page-level to the brick props using the mapExternalDataToProps function.

Usage example
MyBrick.schema = {
  ...
  mapExternalDataToProps: (externalData, bricksProps) => ({
    title: externalData.productName,
    ...
  })
}

mapExternalDataToProps Signature
mapExternalDataToProps?: (externalData: Props, brickProps?: T) => Partial<T>

The function receives:

The external data fetched at page level
The current brick props
The return value should be an object which gets merged with the brick’s props.

Astro Interactivity
For a brick inside an Astro project, you can specify the type of client interactivity.

By default no JavaScript is sent to the client. For interactive bricks that require client-side JavaScript (such as carousels or forms with validation), you can specify the Astro client directives in the brick’s schema.

To do this, add astroInteractivity on the brick’s schema. This property accepts simple values like load, idle, visible, or objects for more complex scenarios.

Here’s the TypeScript defintion for astroInteractivity:

astroInteractivity?:
  | 'load'
  | { load: true } // The same as 'load'
  | 'idle'
  | { idle: true } // The same as 'idle'
  | { idle: { timeout: number } }
  | 'visible'
  | { visible: true } // The same as 'visible'
  | { visible: { rootMargin: string } }
  | { media: string }
  | { only: string }

Usage Examples
Carousel.tsx
...
Carousel.schema = {
  ...
  astroInteractivity: 'load'
}

Embed Pages
Sometimes you need a block or set of blocks that you can reuse across different pages. This allows changes to the original block(s) to be reflected on every page that embeds them (for example, a CTA with a newsletter subscription form).

You can achieve this through special “embed bricks” that allow you to embed one page inside another. When you modify the original page, the changes automatically appear on every page that embeds it.

Note

It’s generally advisable to save these “reusable fragments”—which aren’t full pages with a route in the website—using an Entity pageType (a page type with isEntity set to true). This prevents these fragments from appearing in the main pages list.

The Default Embed Brick
By default (unless disabled via the enableDefaultEmbedBrick configuration), you have access to a pre-made “embed brick” that allows editors to embed any page of any type.

Custom Embed Brick
You can create a custom embed brick that restricts editors to embedding only pages of a specific type.

An embed brick must have a sideEditProp with name types.EmbedProp, of type types.SideEditPropType.Relationship.

You can limit the pages an editor can select to just one pageType by using the references property of relationshipOptions.

Example usage
const embedPageBrick: types.Brick = () => null

embedPageBrick.schema = {
  name: 'product-embed',
  label: 'Embed Product',
  category: 'Embed',
  sideEditProps: [
    {
      name: types.EmbedProp, // This triggers Embedding
      label: 'Embed a product',
      type: types.SideEditPropType.Relationship,
      relationshipOptions: {
        references: 'product', // You can choose to limit choice to just one pageType
        multiple: false, // Multiple not supported for embeds
      },
      helperText: 'Choose a product, save to view it.',
    },
  ],
}

usePageValues
The usePageValues hook allows you to access and modify page meta values within your bricks.

Usage Example
// The returned array contains the Page values and a setter function
const [page, setPage] = usePageValues()

return (
  <div>
    {/* Access the page creation date */}
    <p>Created at {moment(page.createdAt).format('MM/DD/YYYY')}.</p>

    {/* Access the page title */}
    <p>Page title: {page.meta.title}</p>

    {/* Access a custom field's value */}
    <p>Page title: {page.customValues.productId}</p>
  </div>
)

Hook Signature
const usePageValues = (): [
  types.PageValues,
  (pageData: types.PartialPage) => void
]

The usePageValues is called without arguments.

It returns an array containing the page values and a setter function: [pageValues, setPageValues].

pageValues is an object with the structure shown below
setPageValues is a function to set the values (merging the object one level deep).
Note

On the frontend site, the setPage function has no effect.

Returned Values
The returned object has the following structure:

type PageValues = {
  id: string
  type: string
  name: string
  slug: string
  meta: IMeta
  customValues?: Props
  externalData?: Props
  authorId?: string
  author: Author
  status: PageStatus
  editStatus: EditStatus
  isLocked: boolean
  tags: string[]
  category?: string
  createdAt: string
  publishedAt?: string
  scheduledForPublishingOn?: string
  language: string
  translations: Translation[]
  lastEditedBy: LastEditedBy
}

For more details, refer to the following type definitions:

Page
IMeta
Props
Author
PageStatus
EditStatus
Translation
LastEditedBy

Page Types
Page types are a way to group similar pages and apply specific configurations to them.

A Page Type can define:

A Template. See Page Templates
Allowed / excluded block types
Default status for new pages: locked or unlocked, draft or published
Default content, language and featured image
Featured image aspect ratio
Custom fields, if any
The getExternalData function to get data from external APIs
Categories to organize the pages
A Slug Prefix enforced by the editor
Headless View when you just need to edit custom fields with no visual editing
In React Bricks configuration, pageTypes is an array of pageType objects.

For starter projects, you’ll find a pageTypes.ts file in the /react-bricks directory.

Usage Example
const pageTypes: types.IPageType[] = [
  ...{
    name: 'post',
    pluralName: 'posts',
    defaultLocked: false,
    defaultStatus: types.PageStatus.Draft,
    getDefaultContent: () => ['title'],
    allowedBlockTypes: ['title', 'paragraph', 'image', 'video', 'code'],
  },
]

Properties
Each pageType object has the following shape:

interface IPageType {
  name: string
  pluralName: string
  isEntity?: boolean
  headlessView?: boolean
  allowedBlockTypes?: string[]
  excludedBlockTypes?: string[]
  defaultLocked?: boolean
  defaultStatus?: PageStatus
  defaultFeaturedImage?: string
  getDefaultContent?: () => (string | IBrickStory | IContentBlock)[]
  customFields?: Array<ISideEditPropPage | ISideGroup>
  getExternalData?: (page: Page) => Promise<Props>
  getDefaultMeta?: (page: PageFromList, externalData: Props) => Partial<IMeta>
  metaImageAspectRatio?: number
  categories?: ICategory[]
  slugPrefix?: {
    default: string
    translations?: {
      [key: string]: string
    }
  }
  template?: Array<TemplateSlot>
  renderWrapper?: (args: {
    children: React.ReactElement
    page: PageValues
    renderEnvironment: 'Frontend' | 'Preview' | 'Admin'
  }) => React.ReactElement
}

Properties definition
Property	Definition
name	The unique name for this page type (e.g., “product”).
pluralName	The plural name used in the editing interface (e.g., “Products”).
isEntity	Boolean (default false). If true, pages of this type will be organized under the “Entities” tab in the left sidebar. This provides a useful logical separation for editors to understand which pages are meant as reusable fragments or entities and are not true pages.
headlessView	Boolean (default false). If true, pages of this type will show a “form” interface to edit custom fields, with no visual editing of content.
allowedBlockTypes	Array of block type names allowed for this page type. By default, all block types are allowed.
excludedBlockTypes	Array of block type names not allowed for this page type. Useful when most block types are allowed. React Bricks will exclude blocks found in this list or not found in allowedBlockTypes if provided.
defaultLocked	The default lock status for new pages. Set to true for pages with a fixed structure.
defaultStatus	The default visibility status (draft or published) for new pages of this type.
defaultFeaturedImage	The default URL for the featured image of this pageType, used if no featured image is provided via the Document sidebar.
getDefaultContent	Function that returns the default content for a new page of this type. It can return strings (brick names), IBrickStory objects, or IContentBlock objects.
customFields	Array of custom fields or groups of custom fields for this page type, editable via the sidebar’s “Document” tab. See Custom fields
getExternalData	Function that takes a Page as argument and returns a promise resolving to an object with string keys. See External content
getDefaultMeta	Function that takes a Page and External Data as arguments and returns a object with type IMeta (or partial) with meta data, Open Graph data, X (Twitter) card data, Schema.org data. Useful for populating meta from an external API, like a headless commerce system.
metaImageAspectRatio	Aspect ratio for cropping the featured image in the page meta.
categories	Array of objects with interface ICategory to organize pages within this pageType. Editors can select a category from this list, and pages will be organized accordingly in the left sidebar menu.
slugPrefix	Prefix to apply to the slug of each page in this pageType, with its default value and values for each locale.
template	A Page Template, defined as a set of Slots. See Page Template.
renderWrapper	Function to render a wrapper around the page content. The arguments are the children to wrap, the page and the render environment (admin, frontend or preview)
Usage Example with Template
const pageTypes: types.IPageType[] = [
  ...{
    name: 'product',
    pluralName: 'products',
    defaultStatus: types.PageStatus.Published,
    template: [
      {
        slotName: 'heading',
        label: 'Heading',
        min: 1,
        max: 1,
        allowedBlockTypes: ['hero-unit'],
        editable: true,
        getDefaultContent: () => [
          // Default content defined with a story
          { brickName: 'hero-unit', storyName: 'gradient-hero-unit' },
        ],
      },
      {
        slotName: 'content',
        label: 'Content',
        min: 0,
        max: 4,
        allowedBlockTypes: [
          'text-image',
          'call-to-action',
          'customers',
          'paragraph',
        ],
        editable: true,
        getDefaultContent: () => ['text-image', 'customers'],
      },
      {
        slotName: 'footer',
        label: 'Footer',
        min: 1,
        max: 1,
        allowedBlockTypes: ['call-to-action'],
        editable: false,
        // no default content => you'll get 1 block
        // of type call-to-action because of min: 1
      },
    ],
  },
]

Render a list of pages with <List>
Using the <List> components, it’s possible to easily render a list of pages of a certain pageType without calling the fetchPages function (or using the usePages hook).

Properties
Here’s the List component interface:

interface ListProps {
  of: string
  where?: {
    tag?: string
    language?: string
    filterBy?: {
      [key: string]: any
    }
  }
  sort?: string
  page?: number
  pageSize?: number
  children: ({
    items,
    pagination,
  }: types.PagesFromListWithPagination) => React__default.ReactElement
}

Properties definition
Property	Definition
of	The page type of the pages to fetch.
where	Filter by tag, language or custom fields
sort	Sort (minus sign before the field name to sort descending)
page	The page number (for pagination)
pageSize	The page size (for pagination)
children	The children should be a function with an object as argument, from which you can get items and pagination to render each item of the list.
Usage example
<List
  of="blogPost"
  where={{
    language: 'fr',
    tag: 'cms',
    filterBy: { myCustomField: 'foo' },
  }}
  sort="-publishedAt"
  page={1}
  pageSize={20}
>
  {({ items, pagination }) => {
    return (
      <>
        {items.map((post) => {
          return (
            <PostListItem
              key={post.id}
              title={post.meta.title || ''}
              href={post.slug}
              content={post.meta.description || ''}
              author={post.author}
              date={post.publishedAt || ''}
              featuredImg={post.meta.image}
            />
          )
        })}
      </>
    )
  }}
</List>

Page Templates
Introduction
Page templates allow to configure a set of predefined slots for a pageType. Each slot is a fixed part of the page with a name, label, min and max number of blocks and allowedBricks. It can be editable or not and have default content, defined by the getDefaultContent function.

Templates are ideal for pages like e-commerce product details, where you have fixed sections that may fetch data from external APIs, as well as more flexible areas for content editors to customize.

Properties
Each template object has the following shape:

type TemplateSlot = {
  slotName: string
  label: string
  min?: number
  max?: number
  allowedBlockTypes?: string[]
  excludedBlockTypes?: string[]
  editable?: boolean
  getDefaultContent?: () => (string | IBrickStory | IContentBlock)[]
}

Properties definition
Property	Definition
slotName	The name for the slot, unique for the pageType.
label	Label for the slot showed in the editing interface.
min	Minimum number of bricks
max	Maximum number of bricks
allowedBlockTypes	The bricks allowed in this slot
excludedBlockTypes	The bricks not allowed in this slot
getDefaultContent	Function that returns the default content for a new page of this slot.
If the function returns a string for a block, it should be a brick name: the default content for that brick will be used to populate the block.
In case of an IBrickStory, a particular story of the brick is used to populate the block.
In case of IContentBlock you can provide the exact content block (id, type and props).
Usage example
const pageTypes: types.IPageType[] = [
  {
    name: 'product',
    pluralName: 'products',
    defaultStatus: types.PageStatus.Published,
    template: [
      {
        slotName: 'heading',
        label: 'Heading',
        min: 1,
        max: 1,
        allowedBlockTypes: ['product-heading'],
        editable: true,
      },
      {
        slotName: 'content',
        label: 'Content',
        min: 0,
        max: 4,
        allowedBlockTypes: [
          'text-image',
          'product-info',
          'carousel',
          'paragraph',
        ],
        editable: true,
        getDefaultContent: () => ['product-info', 'carousel'],
      },
      {
        slotName: 'related-products',
        label: 'Related Products',
        min: 1,
        max: 1,
        allowedBlockTypes: ['related-products'],
        editable: false,
      },
    ],
  },
  // ...
]

Rendering single Slots
Once you define slots on a page template, you can also render single slots instead of a full page. Rather than using <PageViewer page={page}>, you can render a single slot using the <Slot> component:

<Slot page={page} name="heading">

Custom Fields
For each pageType, you can configure an array of custom fields with their respective types.

These custom fields are editable via sidebar controls for each page of that type, allowing you to have structured data on the page alongside the block content.

Custom fields are defined in the customFields property of a page type. The structure of this array is identical to the sideEditProps of a brick, enabling you to use all sidebar control types and organize custom fields into collapsible sections.

For more information, please refer to the brick’s sidebar controls documentation.

Usage Example
pageTypes: [
  ...{
    name: 'product',
    pluralName: 'products',
    customFields: [
      {
        name: 'productID',
        label: 'Product ID',
        type: types.SideEditPropType.Text,
      },
    ],
  },
]

Custom Fields for all Page Types
If you have custom fields that apply to all page types, you can define them in the customFields property of the root React Bricks configuration.

Reuse Content Across Pages
React Bricks offers several methods for reusing content across pages. In this section, we’ll summarize these methods, highlighting the use case for each and providing links to the relevant documentation.

Summary
Reusing content need	How to achieve it
”Cookie cutter” to reuse bricks’ configuration	Stories
”Change once, apply everywhere” block	Embed
Layout fragment, like header and footer	Dedicated <PageViewer> in layout
Stories
Stories are a way to save and reuse a brick’s configuration, reapplying the same set of props. They can be created in code, pre-configuring a single brick into different relevant configurations, or by content editors to save and reuse a particular brick configuration.

Bricks configured using a story aren’t bound to that story: changing the story afterwards won’t affect the bricks created using that story, much like changing a cookie cutter shape won’t affect cookies already baked.

Read the Stories documentation.

Embed
Embed bricks allow you to embed the content of a page inside other pages. In this case, changing the original page will affect all the pages embedding it, updating them accordingly.

This provides a single source of truth, useful for elements like CTAs that you want to change everywhere on your website simultaneously.

Read the Embed documentation.

Header and Footer
Some layout elements, like header and footer, are shared across all pages of a website.

It’s usually better not to use an embed for these elements to avoid triggering a fetch of these header and footer entities for every page during the build process. Instead, it’s more efficient to have two dedicated <PageViewer>s in the layout rendering the children routes, as seen in the starter projects scaffolded by the CLI.

You can create the header and footer pages under a dedicated pageType with isEntity set to true. This makes them visible under the “Entities” tab rather than among all other pages.

Get data from external APIs
Sometimes you need to fetch data from external sources and render it inside bricks.

For instance, when creating a headless commerce system, some product data might come from the headless platform, while other parts of the product details page are visually edited by the marketing team. This approach is also useful when dealing with legacy APIs containing product data sheets.

In React Bricks, you can fetch external data at two levels:

Within each brick that requires external data
At the page level, defined for each pageType
Fetch external data in a brick
This is the most straightforward method, as each brick directly fetches the data it needs.

To fetch and use data from external APIs in a brick, define a getExternalData function in the brick’s schema. This async function returns a promise that resolves to an object, which is then merged with the brick’s props.

For more details, see the schema’s Connect external APIs documentation.

Fetch external data in pages
If multiple bricks need to access the same external data, it may be more efficient to fetch this data at the page level and then allow each brick to use the relevant portion of the data.

In this scenario, define getExternalData on the pageType. For bricks that need to access this data, add a mapExternalDataToProps function to their schema. This function maps the external data object on the page to an object that’s merged with the brick’s props.

For more information, refer to the Page Types documentation.

Customize React Bricks
React Bricks is designed to be highly flexible and customizable to your specific needs.

The React Bricks main configuration file is located at /react-bricks/config.ts.

In this file, you can customize various settings, including the Logo for the Admin header. Many parameters will be pre-configured by the starter, depending on your chosen React framework.

Configuration object
{
  appId: string
  apiKey: string
  environment?: string
  bricks?: types.Brick<any>[] | types.Theme[]
  pageTypes?: types.IPageType[]
  logo?: string
  loginUI?: types.LoginUI
  contentClassName?: string
  defaultTheme?: string
  renderLocalLink: types.RenderLocalLink
  navigate: (path: string) => void
  loginPath?: string
  editorPath?: string
  playgroundPath?: string
  appSettingsPath?: string
  previewPath?: string
  getAdminMenu?: (args: { isAdmin: boolean }) => types.IMenuItem[]
  isDarkColorMode?: boolean
  toggleColorMode?: () => void
  useCssInJs?: boolean
  appRootElement: string | HTMLElement
  clickToEditSide?: types.ClickToEditSide
  customFields?: Array<types.ISideEditPropPage | types.ISideGroup>
  responsiveBreakpoints?: types.ResponsiveBreakpoint[]
  enableAutoSave?: boolean
  disableSaveIfInvalidProps?: boolean
  enablePreview?: boolean
  blockIconsPosition?: types.BlockIconsPosition
  enablePreviewImage?: boolean
  enableUnsplash?: boolean
  unsplashApiKey?: string
  enableDefaultEmbedBrick?: boolean
  permissions?: types.Permissions
  allowAccentsInSlugs?: boolean
  warningIfLowBattery?: boolean
  rtlLanguages?: Array<string>
}

We can group configuration settings into five main categories:

1. Main CMS Configuration
Property	Definition
bricks	Defines content blocks. It’s either an array of Bricks or a hierarchical structure of themes » categories » bricks.
pageTypes	Defines page types. It is an array of Page types
customFields	Array of custom fields or field groups on a Page, editable via the sidebar’s “Page” tab. See Custom fields
permissions	Object to specify fine-grained permissions. See Permissions
2. Environment settings
Except for logo and contentClassName, all these environment settings are pre-configured by your chosen starter.

Property	Definition
appId	Identifies your React Bricks app. Typicially imported from .env. It’s public, serving as an identifier, not for API authentication.
apiKey	API Key for React Bricks APIs. Typicially imported from .env. Used to authenticate Read API calls from the frontend.
environment	Specifies the project environment. See Multiple environments.
contentClassName	Class applied to content in the Admin interface, when a wrapping class name is needed to ensure the editing environment matches the front-end appearance.
renderLocalLink	Functional component wrapping your router Link component (e.g. the Next <Link> component). Used by the React Bricks <Link>, which renders a <a> tag for external URLs and renderLocalLink for local paths.

Props include:
- href (required): destination path
- children (required): link children elements
- className: class to be applied to links
- activeClassName: class to be applied to active links
- isAdmin: true for the admin interface header links.

See RenderLocalLink
navigate	Function to navigate to a page. Typically it uses the framework’s navigation function. Required for React Bricks’ authentication redirects.
loginPath	Admin “Login” page path. Default: /admin.
editorPath	Admin “Editor” page path. Defaults: /admin/editor.
playgroundPath	Admin “Playground” page path. Default: /admin/playground.
appSettingsPath	Admin “App Settings” page path. Default: /admin/app-settings.
previewPath	Admin “Preview” page path. Default: /preview.
appRootElement	String selector (e.g.,#root) or HTML Element (e.g., document.getElementById('root')). Ensures WAI-ARIA compliant accessibility for Admin modals.
unsplashApiKey	Your Unsplash API Key. Required for Unsplash image search functionality.
rtlLanguages	The array of RTL languages: the default is ‘ar’, ‘az’, ‘dv’, ‘fa’, ‘ff’, ‘he’, ‘ks’, ‘ku’, ‘pa’, ‘ps’, ‘ug’, ‘ur’, ‘yi’
3. UI configuration
Property	Definition
logo	URL for the logo in the Admin interface header.
loginUI	Object configuring the Login interface UI: sidebar image, logo (with width and height), and welcome message (with CSS styles) See the LoginUI interface reference
getAdminMenu	Function receiving the isAdmin boolean on the argument object and returning an array of IMenuItem.

If provided, the editorPath, playgroundPath and appSettingsPath are ignored.
clickToEditSide	Specifies the Viewer’s “click-to-edit” button position. Default: types.ClickToEditSide.BottomRight. See the possible values.
responsiveBreakpoints	Optional responsive breakpoints for preview. Defaults to 375px, 768px and 100%. Array of objects with the BreakPoint interface.
blockIconsPosition	Default: types.BlockIconsPosition.OutsideBlock. Set to types.BlockIconsPosition.InsideBlock to render block action icons (add before, add after, delete, move up, move down, duplicate) inside the block.
defaultTheme	Default selected theme in the “Add new brick” interface, when you have bricks of multiple themes.
4. Feature flags
Property	Definition
enableAutoSave	Default: true. Allows users to activate autosave via a switch near the Save button.
disableSaveIfInvalidProps	Default: false. If true, prevents saving when any sideEditProp is invalid (validate function present and not returning true)
enablePreview	Default: true. Enables the preview button.
enablePreviewImage	Default: false. If true, enables visual selection of new bricks using images. Requires previewImageUrl in the bricks’ schema.
enableUnsplash	Default: true. Enables Unsplash image search.
enableDefaultEmbedBrick	Default: true. Provides a default “embed” brick type for page embedding. See Page embed.
allowAccentsInSlugs	Default: false. If true, allows accented letters in slugs.
warningIfLowBattery	Default: false. If true, React Bricks will alert users to save their work or charge their device when battery levels fall below 15% without a power source connected.
5. CSS related
Property	Definition
isDarkMode	A boolean indicating if dark mode is active. Useful to test dark mode while editing, if your Bricks support dark mode.
toggleDarkMode	Function to toggle dark mode. Used to test dark mode in the editor.
useCssInJs	Boolean that must be set to true when using a CSS-in-JS library.

Set Custom Permissions
For default roles and permission, refer to Roles and Permissions

Custom Roles
The Dashboard allows you to create custom Roles, which can be assigned to Users and used to define custom Permissions.

Custom Permissions
Custom permissions are defined using the permissions object in the React Bricks configuration.

Permissions are implemented by providing one of more permission functions.

The available permission functions are:

canAddPage: (user, pageType) => boolean
canAddTranslation: (user, pageType, language) => boolean
canSeePageType: (user, pageType) => boolean
canSeePage: (user, page) => boolean
canEditPage: (user, page) => boolean
canDeletePage: (user, page) => boolean
canDeleteTranslation: (user, page) => boolean
canUseBrick: (user, brick) => boolean
The complete description of the Permissions type is as follows:

type Permissions = {
  canAddPage?: (user: PermissionUser, pageType: string) => boolean
  canAddTranslation?: (
    user: PermissionUser,
    pageType: string,
    language: string
  ) => boolean
  canSeePageType?: (user: PermissionUser, pageType: string) => boolean
  canSeePage?: (
    user: PermissionUser,
    page: Omit<PermissionPage, 'language'>
  ) => boolean
  canEditPage?: (user: PermissionUser, page: PermissionPage) => boolean
  canDeletePage?: (
    user: PermissionUser,
    page: Omit<PermissionPage, 'language'>
  ) => boolean
  canDeleteTranslation?: (user: PermissionUser, page: PermissionPage) => boolean
  canUseBrick?: (user: PermissionUser, brick: PermissionBrick) => boolean
}

Usage Example
Let’s say we’ve created the custom roles blog_editor and translator_fr in the dashboard.

Now, we’ll create two permission rules:

Prevent all editors from adding institutional pages and restrict blog_editor users to adding only pages of type blog.
Prevent French translators from deleting translations in languages other than French.
<ReactBricks
  ...
  permissions={{
    canAddPage: (user, pageType) => {
      if (
        pageType === 'institutional' ||
        user.customRole.id === 'blog_editor' && pageType !== 'blog') {
        return false
      }
      return true
    },
    canDeleteTranslation: (user, page) => {
      if (user.customRole.id === 'translator_fr' && page.language !== 'fr') {
        return false
      }
      return true
    }
  }}
>
  ...
</ReactBricks>

Get images from Unsplash
In the Media Library (DAM), editors can search for images from Unsplash by entering keywords and selecting the desired aspect ratio (vertical, horizontal, or square) and primary color.

Provide your Unsplash API Key
To use this feature, you need to set your unsplashApiKey in the React Bricks Configuration.

Without this API key, React Bricks will use our proxy APIs to Unsplash with a limited rate of 20 searches per hour per app, allowing you to test the feature.

Note

This feature is enabled by default. You can disable it by setting enableUnsplash to false in the React Bricks Configuration.

What changes for RSC
Starting from v4.2 React Bricks supports React Server Components (RSC) with the react-bricks/rsc package.
If you would like to know more about RSC, we suggest to read the Where do React Server Components fit in the history of web development article by Matteo Frana and also Making Sense of React Server Components by Josh Comeau.

As Next.js is the first framework leveraging React Server Components, RSC are now available in the Next.js starters with the App Router. If you scaffold a new project from the CLI using the “Next.js with App Router” starter, you will have a complete project using React Bricks in the React Server Components flavour.

Server components are a completely new paradigm and this imposed some changes to the React Bricks APIs in the react-bricks/rsc package.

In this section of the documentation, you will find everything that changes when using Server Components with an RSC-enabled starter and the react-bricks/rsc package.

New packages: /rsc and /rsc/client
Server components
In Server Components, the following items should be imported from react-bricks/rsc:

File, Image, JsonLd, Link, PageViewer, Plain, Repeater, RichText, RichTextExt, Text, blockPluginConstructor, blockWithModalPluginConstructor, cleanPage, fetchPage, fetchPages, fetchTags, getPagePlainText, markPluginConstructor, plugins, types

While the following imports are not available for Server Components:

Preview, Meta, getSchemaOrgData, renderJsonLd, renderMeta, useAdminContext, usePage, usePagePublic, usePageValues, usePages, usePagesPublic, useReactBricksContext, useTagsPublic, useVisualEdit,

Client components
In Client Components (with ‘use client’), the following items should be imported from react-bricks/rsc/client:

ReactBricks, useAdminContext, usePageValues, useReactBricksContext, useVisualEdit, types

Hooks replacements for server components
isAdmin
isAdmin(): boolean

Function which returns true if execution runs inside the Admin interface, false otherwise.

It replaces the useAdminContext hook, not available for server components.

getPageValues
getPageValues(): types.PageValues | null

Function which returns the pageValues of the current page.

It replaces the usePageValues hook, not available for server components.

For client components
register
register(config: types.ReactBricksConfig): void

Function that initializes the React Bricks configuration so that it is available to render the page with RSC. This function should be invoked before using any component or function imported from react-bricks/rsc.

wrapClientComponent
wrapClientComponent<T>({
  ClientComponent: React.FC<T>,
  RegisterComponent: React.FC<any>,
  schema: types.IBlockType<T>,
}): types.Brick<T>

Function which wraps a client component (a component with 'use client') and, adding the schema, returns a React Bricks’ brick. RegisterComponent is a function from react-bricks/rsc/client.

Meta data
getMetadata
getMetadata(page: types.Page): IMetadata

Next.js 14+ with the App Router has its way of managing meta data. This function returns the page metadata so that they are compatible with Next.js Metadata.

Preview link
fetchPagePreview
fetchPagePreview({
  token: string
  config: types.ReactBricksConfig
  fetchOptions?: types.FetchOptions
}): Promise<types.Page>

Function which fetches the page data so that it can be viewed in a preview link.

It is an alternative solution to the <Preview> component used in the non-RSC library.

Other functions
getBlockValue
getBlockValue(propName: string): any | null

Function which returns the value of the propName for the current block in a server component.

getBricks
getBricks(): types.Bricks

Function to get all the configuration’s bricks in a server component.

Under react-bricks/rsc/client
RegisterComponent
RegisterComponent: React.FC<RegisterComponentProps>

type RegisterComponentProps = { page: types.Page; block: types.IContentBlock }

Function to be used together with wrapClientComponent to create bricks from client components.

ClickToEdit
ClickToEdit: React.FC<ClickToEditProps>

interface ClickToEditProps {
  pageId: string
  language?: string
  editorPath: string
  clickToEditSide?: types.ClickToEditSide
}

Client component that shows the icon to edit the page when a user is viewing the frontend website while logged in the admin interface.

Updated Components
When using React Server Components, the visual components (Text, RichText, Image, File Repeater, Link) must be imported from react-bricks/rsc and they have a slightly different APIs, as we need to pass them the value of the prop.

Text
Add the value prop. You get it from the component’s props. The type should be declared as ReactBricks.types.TextValue.

Before
import { Text } from 'react-bricks/frontend'

...
<Text
  propName="title"
  placeholder="Enter the title"
  renderBlock={({ children}) => (
    <p className="text-xl">
      {children}
    </p>
  )}
>

After
// highlight-next-line
import { Text } from 'react-bricks/rsc'

...
<Text
  propName="title"
  // highlight-next-line
  value={title}
  placeholder="Enter the title"
  renderBlock={({ children}) => (
    <p className="text-xl">
      {children}
    </p>
  )}
>

RichText
Add the value prop. You get it from the component’s props. The type should be declared as ReactBricks.types.TextValue.

Before
import { RichText } from 'react-bricks/frontend'

...
<RichText
  propName="title"
  placeholder="Enter the title"
  renderBlock={({ children}) => (
    <h1 className="text-xl">
      {children}
    </h1>
  )}
>

After
// highlight-next-line
import { RichText } from 'react-bricks/rsc'

...
<RichText
  propName="description"
  // highlight-next-line
  value={description}
  placeholder="Enter the description"
  renderBlock={({ children}) => (
    <p>
      {children}
    </p>
  )}
  allowedFeatures={[types.RichTextFeatures.Bold]},
>

Image
Add the source prop. You get it from the component’s props. The type should be declared as ReactBricks.types.IImageSource.

Before
import { Image } from 'react-bricks/frontend'

...
<Image propName="avatar" alt="Avatar" />

After
// highlight-next-line
import { Image } from 'react-bricks/rsc'

...
<Image
  propName="avatar"
  // highlight-next-line
  source={avatar}
  alt="Avatar"
/>

File
Add the source prop. You get it from the component’s props. The type should be declared as ReactBricks.types.IFileSource.

Before
import { File } from 'react-bricks/frontend'

...
<File propName="document" />

After
// highlight-next-line
import { File } from 'react-bricks/rsc'

...
<File
  propName="document"
  // highlight-next-line
  source={document}
/>

Repeater
Add the items prop. You get it from the component’s props.
The type should be declared as ReactBricks.types.RepeaterItems<T> where T (not mandatory) is the type of the single repeated item (you can import it from the repeated brick).
If you specify T, you have the result of getDefaultProps fully typed also for repeated items.

Before
import { Repeater } from 'react-bricks/frontend'

...
<Repeater propName="features" />

After
// highlight-next-line
import { Repeater } from 'react-bricks/rsc'

...
<Repeater
  propName="features"
  // highlight-next-line
  items={features}
/>

Client (interactive) components
When using the react-bricks/rsc library in a Server Components starter, if you have interactive bricks, which need client hydration, you need to create 2 components: a server wrapper and the client component, in this way:

Map.tsx
import { types, wrapClientComponent } from 'react-bricks/rsc'
import { RegisterComponent } from 'react-bricks/rsc/client'

import MapClient, { MapProps } from './MapClient'

const MAPTILER_ACCESS_TOKEN = '' // Insert access token

const schema: types.IBlockType<MapProps> = {
  name: 'map',
  label: 'Map',
  category: 'contact',
  tags: ['contacts', 'map'],
  playgroundLinkLabel: 'View source code on Github',
  playgroundLinkUrl:
    'https://github.com/ReactBricks/react-bricks-ui/blob/master/src/website/Map/Map.tsx',
  previewImageUrl: `/bricks-preview-images/map.png`,
  getDefaultProps: () => ({
    lat: '45.6782509',
    lng: '9.5669407',
    zoom: '6',
  }),
  sideEditProps: [
    {
      name: 'zoom',
      label: 'Zoom',
      type: types.SideEditPropType.Number,
    },
    {
      name: 'lat',
      label: 'Latitude',
      type: types.SideEditPropType.Number,
    },
    {
      name: 'lng',
      label: 'Longitude',
      type: types.SideEditPropType.Number,
    },
    {
      name: 'maptiler',
      label: 'MapTiler',
      type: types.SideEditPropType.Custom,
      show: () => !MAPTILER_ACCESS_TOKEN,
      component: () => {
        if (!MAPTILER_ACCESS_TOKEN) {
          return (
            <p className="text-sm">
              For better maps, please create a MapTiler free account and set the{' '}
              <code className="text-xs">MAPTILER_ACCESS_TOKEN</code> string.
            </p>
          )
        }
        return null
      },
    },
  ],
}

export default wrapClientComponent({
  ClientComponent: MapClient,
  RegisterComponent,
  schema,
})

MapClient.tsx
'use client'

import { Map, Marker } from 'pigeon-maps'
import { maptiler } from 'pigeon-maps/providers'
import React from 'react'

export interface MapProps {
  zoom: string
  lat: string
  lng: string
  mapTilerAccessToken: string
}

export const MapClient: React.FC<MapProps> = ({
  lat = '45.6782509',
  lng = '9.5669407',
  zoom = '10',
  mapTilerAccessToken,
}) => {
  const mapTilerProvider = React.useCallback(
    (x: number, y: number, z: number, dpr?: number | undefined) =>
      maptiler(mapTilerAccessToken, 'streets')(x, y, z, dpr),
    [mapTilerAccessToken]
  )

  let mapTilerProviderProp = {}

  if (mapTilerAccessToken) {
    mapTilerProviderProp = {
      provider: mapTilerProvider,
    }
  }

  return (
    <Map
      center={[parseFloat(lat), parseFloat(lng)]}
      height={350}
      metaWheelZoom
      zoom={parseInt(zoom, 10)}
      {...mapTilerProviderProp}
      dprs={[1, 2]}
      metaWheelZoomWarning="Use ctrl + wheel to zoom!"
      attribution={false}
    >
      <Marker anchor={[parseFloat(lat), parseFloat(lng)]} />
    </Map>
  )
}

export default MapClient

useVisualEdit
Custom Visual editing components
Sometimes you may want to add new visual editing components beyond the predefined Text, RichText, Image, or File.

For instance, you might want to create a code editor (like the one found in React Bricks UI blocks) or a canvas where editors can draw.

The useVisualEdit hook allows you to create a custom visual editing component that reads from a block property and saves back to that property.

Usage Example
const [value, setValue, isReadOnly] = useVisualEdit('my-prop')

if (isReadOnly) {
  // Here we are on the frontend
  return (
    <div>{value}</div>
  )
}

// Here we are in the content administration interface
return (
  <MyEditorComponent value={value} onChange={setValue}>
)

Hook Definition
const useVisualEdit = (
  propName: string
): [any, (value: any) => void, boolean]

The useVisualEdit hook takes a propName as argument and returns a [value, setValue, isReadOnly] array.

You can use value, setValue, and isReadOnly to create your editing component:

value is the value of the prop
setValue function that accepts a value as argument and sets the prop accordingly
isReadOnly is true in the frontend and Preview mode, while false in the Admin Editor

RichTextExt (Extensible RichText)
The RichTextExt component is an extensible version of the RichText component.

Unlike the standard RichText, it employs a plugin system. This allows you to replace any part of a default plugin—not just the render function, but also the button icon, label, shortcut key, etc.—and add new plugins.

Note: for most use cases, you should use the normal RichText, which is simpler to use.

Usage Example
In this example, we’re not creating custom plugins. Instead, we’re configuring the RichTextExt component to use predefined rich text plugins while overriding the shortcut key and render function of the “quote” plugin:

import { RichTextExt as RichText, plugins } from 'react-bricks/frontend'

const { bold, italic, unorderedList, link, quote } = plugins

return (
  <RichText
    renderBlock={({ children }) => (
      <p className="text-lg sm:text-xl text-center">{props.children}</p>
    )}
    placeholder="Type a text..."
    propName="text"
    plugins={[
      bold,
      italic,
      unorderedList,
      link,
      {
        ...quote,
        renderElement: ({ children }) => (
          <div className="border-l-4 pl-4 border-pink-500 text-pink-500 text-xl">
            {children}
          </div>
        ),
        hotKey: 'mod+opt+q',
      },
    ]}
  />
)

Properties
Here’s the Typescript interface for the props of the RichTextExt component:

interface RichTextProps {
  propName?: string
  value?: types.TextValue
  renderBlock?: (props: { children: React.ReactElement }) => JSX.Element
  placeholder?: string
  renderPlaceholder?: (props: { children: React.ReactElement }) => JSX.Element
  multiline?: boolean
  softLineBreak?: boolean
  metaFieldName?: 'title' | 'description' | 'language'
  customFieldName?: string
  customFieldPlainText?: boolean
  plugins?: types.RichTextPlugin[]
}

Properties Definition
For props shared with the RichText component, refer to the RichText documentation. Note that for RichTextExt, properties like allowedFeatures and all render functions (e.g., renderBold) are replaced by the plugins property.

Property	Definition
plugins	An array of plugins extending the rich text functionality, each of type RichTextPlugin
RichTextPlugin is defined as follows:

interface RichTextPlugin {
  type: 'Mark' | 'Block' | 'List'
  name: string
  isInline?: boolean
  itemName?: string
  label: string
  hotKey?: string
  renderElement?: (props: RenderElementProps) => JSX.Element
  renderItemElement?: (props: RenderElementProps) => JSX.Element
  renderLeaf?: (props: RenderLeafProps) => JSX.Element
  toggle: (editor: Editor, plugins: RichTextPlugin[]) => void
  button?: {
    icon: React.ReactElement
    isActive: (editor: Editor) => boolean
  }
  enhanceEditor?: (editor: Editor) => Editor
}

React Bricks uses Slate as its underlying rich text editor.
The RenderElementProps and RenderLeafProps are types from Slate.

RichTextPlugin properties
Plugin	Definition
type	A plugin can be of type “Mark” (a style like bold), “Block” (e.g., an heading) or “List” (for a list of items, like UL).
name	Name of the plugin.
isInline?	Indicates if the element is inline (e.g., for links).
itemName?	Name of the items element in case of a list
label	Displayed when hovering over the button
hotKey?	Shortcut key to apply this marker or block type
renderElement?	Render function for a block plugin. Key arguments: children (actual text content), attributes (to be spread on the top-level DOM element) and element (an object whose type is the plugin name).
renderItemElement?	Render function for a single list item (e.g., a li element).
renderLeaf?	Render function for a mark plugin (e.g., bold or italic). Arguments: children, attributes and leaf. Leaf is an object with truthy keys for applied markers (e.g. if (leaf.bold) {...}).
toggle	Function to toggle the marker or block on the editor.
button	Customizes the default button for a plugin or configures the button for a new plugin, providing the icon (a ReactElement) and a isActive function.
enhanceEditor	Function to enhance the Slate editor. Returns an enhanced editor. Refer to Slate documentation. This is a very powerful option to customize the React Bricks RichText behavior.
Plugins helpers
For common marker (bold, italic, highlight…) or block (heading, quote, etc.) plugins, React Bricks provides helpers that allow you to create new plugins very quickly:

Mark plugins helper
Block plugins helper
There’s also a helper for creating complex plugins that require a popup configuration interface. This helper enables you to add custom fields of various types (such as text, select, and autocomplete) that content editors can modify. The plugin then uses these field values:

Block with modal plugins helper

API Docs Introduction
While the Documentation section was targeted at developers leveraging the starter projects, this advanced section is useful to developers who are creating their own architecture using React Bricks, or who need to fully understand how React Bricks components work.

This section explains all the components, context, hooks and utilities exported by the react-bricks library.

This section is organized by type of exported entity and serves as a reference that you might reach from the search bar.

So, red pill and I show you how deep the rabbit hole goes… 🐇

Components structure
ReactBricks
The <ReactBricks> component wraps everything and it acts as a Provider for the <ReactBricksContext> that make the configuration available through Context to all the other components.

Frontend site
components-structure-frontendThe frontend website uses the <PageViewer> component to render a page. It has a page prop which expects the content of a Page from React Bricks API (see also usePage and fetchPage). It renders your bricks with React Bricks visual edit components (Text, RichText, Image, File, Repeater) in read-only mode.

Images are lazy loaded and an optimized version is requested based on screen resolution. The Repeater components render your nested block as they do in the Admin interface.

If you are logged in the Admin, the PageViewer components renders also a floating edit button, so that you can directly go to the interface to edit the page you are viewing.

Admin
components-structure-frontendOn the Admin, every component should be wrapped also by the <Admin> component, which manages authentication and renders the Interface menu.

The <Admin> component contains also a Provider for the AdminContext (current page, preview mode, etc.).

If you build the admin interface yourself, you should create views (routed by your router) for the login, editor, playground and page settings pages. Each of these views will have the wrapping <Admin> component and the view-related component: <Login>, <Editor>, <Playground>, <AppSettings>

ReactBricks
The <ReactBricks> component wraps all the other React Bricks components and acts as a Provider for the <ReactBricksContext> that make the configuration and other information (such as the React Bricks version) available to all the other components.

Usage example
import { ReactBricks, types } from 'react-bricks/frontend'

<ReactBricks
  appId="XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
  apiKey="XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
  bricks={...}
  pageTypes={...}
  logo="/logo.svg"
  loginUI={...}
  contentClassName="content"
  renderLocalLink={({ href, children, className, activeClassName }) => {...}}
  navigate={...}
  loginPath="/"
  editorPath="/admin/editor"
  playgroundPath="/admin/playground"
  appSettingsPath="/admin/app-settings"
  previewPath="/preview"
  getAdminMenu={({ isAdmin }) => {...}}
  isDarkColorMode={colorMode === 'dark'}
  toggleColorMode={...}
  useCssInJs={false}
  appRootElement="#root"
  clickToEditSide={types.ClickToEditSide.BottomRight}
  customFields={...}
  responsiveBreakpoints={...}
  enableAutoSave
  disableSaveIfInvalidProps
  enablePreview
  blockIconsPosition={types.BlockIconsPosition.InsideBlock}
  enablePreviewImage
  enableUnsplash
  unsplashApiKey="..."
  enableDefaultEmbedBrick
  permissions={{ ... }}
>
  ...
</ReactBricks>

PageViewer
The PageViewer component is used on your website’s public pages.
It is the component that renders a page on the front-end exactly as you can see it in the Admin Interface, but with React Bricks visual edit components (Text, RichText, Image, File, Repeater) in read-only mode.

Props
interface PageViewerProps {
  page: types.Page | null | undefined
  main?: boolean
}

The PageViewer component has just one required prop: page.
It is the page object you get from React Bricks APIs, using usePage or fetchPage.

Before passing the page object to PageViewer, you need to parse it with the cleanPage utility function, which checks incoming blocks from the DB against your bricks schema.

main is true by default. It enables the “click to edit” feature for this Page Viewer, regardless of the clickToEditSide configuration. This is useful when you have multiple PageViewers on a page (for example for page content, header and footer) to choose which PageViewer is the “main” one that defines the slug to be edited with the icon. Previously this parameter was called showClickToEdit.

Usage example, with usePage hook
import React, { useContext } from 'react'
import {
  PageViewer,
  usePage,
  cleanPage,
  ReactBricksContext,
} from 'react-bricks/frontend'

const Viewer = () => {
  const { data } = usePage('home')
  const { pageTypes, bricks } = useContext(ReactBricksContext)

  // Clean the received content
  // Removes unknown or not allowed bricks
  const page = cleanPage(data, pageTypes, bricks)

  return <PageViewer page={page} />
}

export default Viewer

Usage example, with fetchPage
import React, { useState, useContext, useEffect } from 'react'
import {
  PageViewer,
  fetchPage,
  cleanPage,
  ReactBricksContext,
} from 'react-bricks/frontend'

const ViewerFetch = () => {
  const [page, setPage] = useState(null)
  const { apiKey, blockTypeSchema, pageTypeSchema } =
    useContext(ReactBricksContext)

  useEffect(() => {
    fetchPage('home', apiKey).then((data) => {
      const myPage = cleanPage(data, pageTypeSchema, blockTypeSchema)
      setPage(myPage)
    })
  }, [apiKey, pageTypeSchema, blockTypeSchema])

  if (page) {
    return <PageViewer page={page} />
  }
  return null
}

export default ViewerFetch

Admin
The Admin component should wrap all the components used in the Admin Interface, which are:

Login
Editor
Playground
AppSettings
It manages authentication and renders the Admin menu. It acts also as a Provider for the AdminContext, making it available to the wrapped components.

Props
interface AdminProps {
  isLogin?: boolean
  isPublicDesignSystem?: boolean
  designSystemTitle?: string
}

Properties definition
Property	Definition
isLogin	Default false. It is boolean value to identify the Login page. It is needed to correctly manage the authentication process.
isPublicDesignSystem	If true, the playground is accessible without authentication, in order to use it as a public design system documentation.
designSystemTitle	Title to show in the playground page, if it is a public design system page.
Usage example, editor page
import React from 'react'
import { Admin, Editor } from 'react-bricks'

const EditorPage = () => {
  return (
    <Admin>
      <Editor />
    </Admin>
  )
}

export default EditorPage

Usage example, login page
import React from 'react'
import { Admin, Login } from 'react-bricks'

const LoginPage = () => {
  return (
    <Admin isLogin>
      <Login />
    </Admin>
  )
}

export default LoginPage

Login
This component renders the Login page in the Admin Interface.

It needs no props, but it must be wrapped by the Admin component to receive the needed context.

The route where this component is shown has to be specified in ReactBricks’s configuration parameter loginPath.

Usage example
import React from 'react'
import { Admin, Login } from 'react-bricks'

const LoginPage = () => {
  return (
    <Admin isLogin>
      <Login />
    </Admin>
  )
}

export default LoginPage

Editor
This component renders the Editor page in the Admin Interface.
The Editor is where you edit your page content.

It needs no props, but it must be wrapped by the Admin component to receive the needed context.

The route where this component is shown has to be specified in ReactBricks’s configuration parameter editorPath.

Usage example
import React from 'react'
import { Admin, Editor } from 'react-bricks'

const EditorPage = () => {
  return (
    <Admin>
      <Editor />
    </Admin>
  )
}

export default EditorPage

Playground
This component renders the Playground page in the Admin Interface.
The Playground is useful to preview and test your bricks.

It needs no props, but it must be wrapped by the Admin component to receive the needed context.

The route where this component is shown has to be specified in ReactBricks’s configuration parameter playgroundPath.

Usage example
import React from 'react'
import { Admin, Playground } from 'react-bricks'

const PlaygroundPage = () => {
  return (
    <Admin>
      <Playground />
    </Admin>
  )
}

export default PlaygroundPage

AppSettings
This component renders the AppSettings page in the Admin Interface.
The AppSettings page is where you configure and trigger the build webhooks if you are using a static website generator like Gatsby or Next.js.

It needs no props, but it must be wrapped by the Admin component to receive the needed context.

The route where this component is shown has to be specified in ReactBricks’s configuration parameter appSettingsPath.

Usage example
import React from 'react'
import { Admin, AppSettings } from 'react-bricks'

const AppSettingsPage = () => {
  return (
    <Admin>
      <AppSettings />
    </Admin>
  )
}

export default AppSettingsPage

Text
The Text component enables content editors to edit plain text.

Required properties:

propName: the name of the prop
value: prop’s value (strictly needed only for RSC, but it’s avisable to always provide it for server componenents compatibility)
renderBlock: the render function for this text (the render function for this text (not strictly required; if missing, it renders a simple <span>)
Usage example
// from 'react-bricks/rsc' for usage with server components
import { types, Text } from 'react-bricks/frontend'

interface MyBrickProps {
  title: types.TextValue
}

const MyBrick: types.Brick<MyBrickProps> = ({ title }) => (
  ...
  <Text
    propName="title"
    value={title}
    renderBlock={({ children }) => (
      <h1 className="text-xl font-extrabold">{children}</h1>
    )}
    placeholder="Title..."
  />
  ...
)

MyBrick.schema = { ... }

export default MyBrick

Multi-line
By default, editors can enter a single line of text in a Text component. You can change this behavior by setting the following props:

multiline (false by default): it allows entering multiple lines, each rendering the JSX returned by the renderBlock function
softLineBreak (false by default): if true, it allows entering a soft line break (<br />) using shift+enter
Bind to Meta data or Custom fields
A Text component is typically used to save a text value for the current block in the page.

You can also bind it to a page’s custom field or meta field by replacing propName with customFieldName or metaFieldName. This creates a two-way data binding between the visual editing component and the values you can enter via the sidebar controls in the “Page” tab.

This feature is useful, for example, when you want the title of a hero unit on the page to also set the meta title of the page directly.

Properties
Here’s the Typescript interface for the props of the Text component:

// Props for all the usages of Text
interface BaseTextProps {
  renderBlock?: (props: RenderElementProps) => JSX.Element
  placeholder?: string
  renderPlaceholder?: (props: { children: any }) => JSX.Element
  multiline?: boolean
  softLineBreak?: boolean
}

// Usage with propName (usual case)
interface TextPropsWithPropName extends BaseTextProps {
  propName: string
  value?: types.TextValue
  metaFieldName?: never
  customFieldName?: never
}

// Usage when binding to a Meta Field
interface TextPropsWithMetaFieldName extends BaseTextProps {
  propName?: never
  value?: never
  metaFieldName: 'title' | 'description' | 'language'
  customFieldName?: never
}

// Usage when binding to a Custom Field
interface TextPropsWithCustomFieldName extends BaseTextProps {
  propName?: never
  value?: never
  metaFieldName?: never
  customFieldName: string
}

/**
 * Props for Text component
 */
type TextProps =
  | TextPropsWithPropName
  | TextPropsWithMetaFieldName
  | TextPropsWithCustomFieldName

Properties definition
Property	Definition
propName	The prop of the Brick component corresponding to this text. Mandatory unless you bind the value to a metaFieldName or customFieldName
value	The value of the prop for this text. Required for Server Components, but always recommended for RSC compatibility
renderBlock	A React functional component used to render the text.
placeholder	The placeholder to show when the text is empty.
renderPlaceholder	A React functional component used to render the placeholder, for custom display.
multiline	Default: false. If true allows multiline text.
softLineBreak	Default: false. If true allows soft line breaks.
metaFieldName	Binds the text value to a page Meta field (two-way data binding)
customFieldName	Binds the text value to a page Custom field (two-way data binding)
Usage with Server Components
When working with Server Components, you need to import from 'react-bricks/rsc':

import { types, Text } from 'react-bricks/rsc'

RichText
The RichText component enables content editors to edit a multiline rich text.

It is similar to the Text component, but it allows you to select which rich text features editors can use, such as bold, italic, link, highlight, quote, code, headings (H1..H6), ordered list, unordered list, superscript, and subscript.

You can also customize the default render function for each style.

Required properties:

propName: the name of the prop
value: prop’s value (strictly needed only for RSC, but it’s avisable to always provide it for server componenents compatibility)
renderBlock: the render function for this text (not strictly required, defaults to a simple <span> if omitted)
allowedFeatures: the available rich-text features (none by default)
Usage example
// from 'react-bricks/rsc' for usage with server components
import { types, RichText, Link } from 'react-bricks/frontend'

interface MyBrickProps {
  description: types.TextValue
}

const MyBrick: types.Brick<MyBrickProps> = ({ description }) => (
  ...
  <RichText
    propName="description"
    value={description}
    renderBlock={({ children }) => (
      <p className="text-lg text-gray-600">{children}</p>
    )}
    placeholder="Type a description..."

    allowedFeatures={[
      types.RichTextFeatures.Bold,
      types.RichTextFeatures.Italic,
      types.RichTextFeatures.Link,
      //types.RichTextFeatures.Highlight,
      //types.RichTextFeatures.Heading1,
      //types.RichTextFeatures.Heading2,
      //types.RichTextFeatures.Heading3,
      //types.RichTextFeatures.Heading4,
      //types.RichTextFeatures.Heading5,
      //types.RichTextFeatures.Heading6,
      //types.RichTextFeatures.Code,
      //types.RichTextFeatures.Quote,
      //types.RichTextFeatures.OrderedList,
      //types.RichTextFeatures.UnorderedList,
      //types.RichTextFeatures.Subscript,
      //types.RichTextFeatures.Superscript,
    ]}

    // Override default <b> tag for Bold style
    renderBold={({ children }) => (
      <b className="text-pink-500">
        {children}
      </b>
    )}

    // Override rendering for Links
    renderLink={({ children, href, target, rel }) => (
      <Link
        href={href}
        target={target}
        rel={rel}
        className="text-sky-500 hover:text-sky-600 transition-colors"
      >
        {children}
      </Link>
    )}
  />
  ...
)

MyBrick.schema = { ... }

export default MyBrick

Multi-line
By default, the RichText component allows multiple lines of text. You can modify this behavior with these props:

multiline (default: true): if false, prevents the content editor from creating multiple lines with the Enter key
softLineBreak (default: true): if false, disables the soft line break (<br />)
Bind to Meta data or Custom fields
Typically, a RichText component is used to save a text value for the current block in the page.

You can also bind it to a page’s custom field or meta field by using customFieldName or metaFieldName instead of propName. This creates a two-way data binding between the visual editing component and the values in the sidebar controls of the “Page” tab. For custom fields, you can opt to save the value as plain text using the customFieldPlainText prop.

Properties
Here’s the Typescript interface for the RichText component props:

// For every RichText usage
interface BaseRichTextProps {
  renderBlock?: (props: { children: React.ReactNode }) => JSX.Element
  placeholder?: string
  renderPlaceholder?: (props: { children: React.ReactNode }) => JSX.Element
  multiline?: boolean
  softLineBreak?: boolean
  allowedFeatures?: types.RichTextFeatures[]
  renderBold?: (props: { children: React.ReactNode }) => JSX.Element
  renderItalic?: (props: { children: React.ReactNode }) => JSX.Element
  renderHighlight?: (props: { children: React.ReactNode }) => JSX.Element
  renderCode?: (props: { children: React.ReactNode }) => JSX.Element
  rendersSub?: (props: { children: React.ReactNode }) => JSX.Element
  renderSup?: (props: { children: React.ReactNode }) => JSX.Element
  renderLink?: (props: { href: string, target?: string. rel?: string }) => JSX.Element
  renderUL?: (props: { children: React.ReactNode }) => JSX.Element
  renderOL?: (props: { children: React.ReactNode }) => JSX.Element
  renderLI?: (props: { children: React.ReactNode }) => JSX.Element
  renderH1?: (props: { children: React.ReactNode }) => JSX.Element
  renderH2?: (props: { children: React.ReactNode }) => JSX.Element
  renderH3?: (props: { children: React.ReactNode }) => JSX.Element
  renderH4?: (props: { children: React.ReactNode }) => JSX.Element
  renderH5?: (props: { children: React.ReactNode }) => JSX.Element
  renderH6?: (props: { children: React.ReactNode }) => JSX.Element
  renderQuote?: (props: { children: React.ReactNode }) => JSX.Element
}

// Usage with propName (usual case)
interface RichTextPropsWithPropName extends BaseRichTextProps {
  propName: string
  value?: types.TextValue
  metaFieldName?: never
  customFieldName?: never
  customFieldPlainText?: never
}

interface RichTextPropsWithMetaFieldName extends BaseRichTextProps {
  propName?: never
  value?: never
  metaFieldName: 'title' | 'description' | 'language'
  customFieldName?: never
  customFieldPlainText?: never
}

interface RichTextPropsWithCustomFieldName extends BaseRichTextProps {
  propName?: never
  value?: never
  metaFieldName?: never
  customFieldName: string
  customFieldPlainText?: boolean
}

/**
 * Props for RichText component
 */
type RichTextProps =
  | RichTextPropsWithPropName
  | RichTextPropsWithMetaFieldName
  | RichTextPropsWithCustomFieldName

Properties definition
Property	Definition
propName	The prop of the Brick component corresponding to this text.
value	The value of the prop for this rich text. Required for Server Components, but always recommended for RSC compatibility
renderBlock	A React functional component used to render each paragraph of text.
placeholder	The placeholder to show when the text is empty.
renderPlaceholder	A React functional component used to render the placeholder, for custom display.
multiline	Default: true. If false it prevents multiline text.
softLineBreak	Default: true. If false it prevents soft line breaks.
allowedFeatures	An array of allowed rich text features: the available features are of type types.RichTextFeatures
metaFieldName	Binds the text value to a page Meta field (two-way data binding)
customFieldName	Binds the text value to a page Custom field (two-way data binding)
renderBold	The optional render function for the BOLD marker.
renderItalic	The optional render function for the ITALIC marker.
renderCode	The optional render function for the CODE marker.
renderHighlight	The optional render function for the HIGHLIGHT marker.
renderLink	The optional render function for the LINK marker. Warning: this overrides the default React Bricks Link component (which uses the configured renderLocalLink for local links and a <a> tag for external links).
renderUL	The optional render function for Unordered Lists.
renderOL	The optional render function for Ordered Lists.
renderLI	The optional render function for List Items.
renderH1..H6	The optional render function for Headings.
renderQuote	The optional render function for Quote.
renderSub	The optional render function for Subscript.
renderSup	The optional render function for Superscript.
Usage with Server Components
When working with Server Components, you need to import from 'react-bricks/rsc':

import { types, RichText, Link } from 'react-bricks/rsc'

Create custom plugins
To enhance the RichText component’s default functionality, such as adding an emoji button, you can use the RichTextExt component. This component is designed to be extended with custom plugins.

With RichTextExt, you can develop sophisticated rich text features, including those requiring configuration popups with custom fields. For more information, see the Extensible RichText documentation.

RichTextExt (Extensible RichText)
The RichTextExt component is an extensible version of the RichText component.

Unlike the standard RichText, it employs a plugin system. This allows you to replace any part of a default plugin—not just the render function, but also the button icon, label, shortcut key, etc.—and add new plugins.

Note: for most use cases, you should use the normal RichText, which is simpler to use.

Usage Example
In this example, we’re not creating custom plugins. Instead, we’re configuring the RichTextExt component to use predefined rich text plugins while overriding the shortcut key and render function of the “quote” plugin:

import { RichTextExt as RichText, plugins } from 'react-bricks/frontend'

const { bold, italic, unorderedList, link, quote } = plugins

return (
  <RichText
    renderBlock={({ children }) => (
      <p className="text-lg sm:text-xl text-center">{props.children}</p>
    )}
    placeholder="Type a text..."
    propName="text"
    plugins={[
      bold,
      italic,
      unorderedList,
      link,
      {
        ...quote,
        renderElement: ({ children }) => (
          <div className="border-l-4 pl-4 border-pink-500 text-pink-500 text-xl">
            {children}
          </div>
        ),
        hotKey: 'mod+opt+q',
      },
    ]}
  />
)

Properties
Here’s the Typescript interface for the props of the RichTextExt component:

interface RichTextProps {
  propName?: string
  value?: types.TextValue
  renderBlock?: (props: { children: React.ReactElement }) => JSX.Element
  placeholder?: string
  renderPlaceholder?: (props: { children: React.ReactElement }) => JSX.Element
  multiline?: boolean
  softLineBreak?: boolean
  metaFieldName?: 'title' | 'description' | 'language'
  customFieldName?: string
  customFieldPlainText?: boolean
  plugins?: types.RichTextPlugin[]
}

Properties Definition
For props shared with the RichText component, refer to the RichText documentation. Note that for RichTextExt, properties like allowedFeatures and all render functions (e.g., renderBold) are replaced by the plugins property.

Property	Definition
plugins	An array of plugins extending the rich text functionality, each of type RichTextPlugin
RichTextPlugin is defined as follows:

interface RichTextPlugin {
  type: 'Mark' | 'Block' | 'List'
  name: string
  isInline?: boolean
  itemName?: string
  label: string
  hotKey?: string
  renderElement?: (props: RenderElementProps) => JSX.Element
  renderItemElement?: (props: RenderElementProps) => JSX.Element
  renderLeaf?: (props: RenderLeafProps) => JSX.Element
  toggle: (editor: Editor, plugins: RichTextPlugin[]) => void
  button?: {
    icon: React.ReactElement
    isActive: (editor: Editor) => boolean
  }
  enhanceEditor?: (editor: Editor) => Editor
}

React Bricks uses Slate as its underlying rich text editor.
The RenderElementProps and RenderLeafProps are types from Slate.

RichTextPlugin properties
Plugin	Definition
type	A plugin can be of type “Mark” (a style like bold), “Block” (e.g., an heading) or “List” (for a list of items, like UL).
name	Name of the plugin.
isInline?	Indicates if the element is inline (e.g., for links).
itemName?	Name of the items element in case of a list
label	Displayed when hovering over the button
hotKey?	Shortcut key to apply this marker or block type
renderElement?	Render function for a block plugin. Key arguments: children (actual text content), attributes (to be spread on the top-level DOM element) and element (an object whose type is the plugin name).
renderItemElement?	Render function for a single list item (e.g., a li element).
renderLeaf?	Render function for a mark plugin (e.g., bold or italic). Arguments: children, attributes and leaf. Leaf is an object with truthy keys for applied markers (e.g. if (leaf.bold) {...}).
toggle	Function to toggle the marker or block on the editor.
button	Customizes the default button for a plugin or configures the button for a new plugin, providing the icon (a ReactElement) and a isActive function.
enhanceEditor	Function to enhance the Slate editor. Returns an enhanced editor. Refer to Slate documentation. This is a very powerful option to customize the React Bricks RichText behavior.
Plugins helpers
For common marker (bold, italic, highlight…) or block (heading, quote, etc.) plugins, React Bricks provides helpers that allow you to create new plugins very quickly:

Mark plugins helper
Block plugins helper
There’s also a helper for creating complex plugins that require a popup configuration interface. This helper enables you to add custom fields of various types (such as text, select, and autocomplete) that content editors can modify. The plugin then uses these field values:

Block with modal plugins helper

Image
The Image component enables content editors to upload/select and modify images.

Required properties:

propName: the name of the prop
source: prop’s value (strictly needed only for RSC, but it’s avisable to always provide it for server componenents compatibility)
Other frequently used props:
aspectRatio: forces editors to crop an image with a fixed aspect ratio (e.g. 16 : 9)
alt: fallback alternate text, used if editors don’t provide ALT text via the interface
maxWidth: instructs React Bricks image optimization on the maximum displayed size for this image
quality: sets the image compression quality (default 80)
sizes: provides fine-tuned image direction via the “sizes” attribute
imageClassName: class name applied to the rendered image
Usage example
import { types, Image } from 'react-bricks/frontend'

interface MyBrickProps {
  image: types.IImageSource
}

const MyBrick: types.Brick<MyBrickProps> = ({ image }) => (
  ...
  <Image
    propName="image"
    source={image}
    alt="Product"
    maxWidth="650"
    aspectRatio="1.33"
  />
  ...
)

MyBrick.schema = { ... }

export default MyBrick

Rendering
On the frontend, the Image component displays a responsive, optimized image with progressive loading (lazy load).
In the Admin interface, it allows to replace an image by opening a modal where editors can:
Replace an image from the media library, Unsplash, upload, or URL
Apply transformations (crop, rotate, flip)
Set the alternate text (ALT), SEO-friendly name (for the image URL), and priority for images above the fold
Optimization
To boost performance and SEO, upon upload, React Bricks will:

Create responsive optimized images
Create the srcSet for optimal image selection on the frontend
Create a lightweight blurred placeholder for progressive loading when the native lazy loading is unavailable
Serve images from a global CDN
Enforce SEO-friendly name via proper rewrite rules
Readonly
To render an image loaded in React Bricks as read-only, add the readonly flag.

A common use case is rendering blog post thumbnails in a list of posts loaded via the fetchPages function. You can render a thumbnail for each post using <Image readonly source={...}>.

Bind to Meta data or Custom fields
As for Text and RichText, you can also bind an image to a page’s custom field or meta image by replacing propName with customFieldName or metaFieldName.

This creates a two-way data binding between the visual editing component and the images set via sidebar controls in the “Page” tab.

Properties
Here’s the Typescript interface for the props of the Image component:

// For both editable and readonly images
interface SharedImageProps {
  readonly?: boolean
  source?: types.IImageSource
  alt: string
  noLazyLoad?: boolean
  imageClassName?: string
  imageStyle?: React.CSSProperties
  quality?: number
  sizes?: string
  loading?: 'lazy' | 'eager'
  renderWrapper?: ({
    children: React.ReactNode
    width?: number
    height?: number
  }) => React.ReactElement
  useNativeLazyLoading?: boolean
  useWebP?: boolean
  placeholder?: (props: {
    aspectRatio?: number
    maxWidth?: number
    isDarkColorMode?: boolean
    isAdmin: boolean
  }) => string
}

// For editable images
interface EditableImage extends SharedImageProps {
  readonly?: false
  propName?: string
  metaFieldName?: 'image'
  customFieldName?: string
  aspectRatio?: number
  maxWidth?: number
}

// For readonly images
interface ReadOnlyImage extends SharedImageProps {
  readonly: true
  source: types.IImageSource
}

/**
 * Props for Image
 */
type ImageProps = EditableImage | ReadOnlyImage

Properties definition
Property	Definition
propName	The prop of the Brick component corresponding to this image.
source	The value of the prop for this image. Required for Server Components, but always recommended for RSC compatibility
alt	The fallback alternate text for the image when not provided via the upload modal
maxWidth	The maximum width in pixel at which your image will be displayed. Used to calculate the responsive images for normal and retina displays. Default value is 800.
noLazyLoad	Set to true to avoid lazy loading. Default is false.
aspectRatio	If set, provides a fixed-ratio selection mask to crop the uploaded image.
imageClassName	Optional className to apply to the <img> tag.
imageStyle	Optional style object to apply to the <img> tag.
sizes	Optional string to set the sizes attribute on the image for responsive images serving.
loading	Optional prop to change the loading attribute for native lazy loading. Default is lazy. Usually, the default behaviour suffices.
renderWrapper	Optional render function for a custom wrapper around the image. Provides children, width and height as arguments (width and height are from the original image size, useful for calculating aspect ratio).
useNativeLazyLoading	The default is true: if browser support for native lazy loading is detected, it is used instead of our lazy loading system. Set to false to always use the custom lazy loading.
useWebP	The default is true: creates WebP images upon upload, keeping JPEG (or PNG for transparency) as fallbacks without WebP support. Set to false to skip WebP creation.
metaFieldName	Binds the image value to a page Meta field (two-way data binding)
customFieldName	Bind the image value to a page Custom field (two-way data binding)
placeholder	Function to customize the default image placeholder. Receives { aspectRatio, maxWidth, isDarkColorMode, isAdmin } and should return a string URL. For custom placeholders, explicitly avoid rendering if isAdmin is false to prevent frontend display.
readonly	Default is false. If true, the image is read-only, without an editing interface.
quality	Quality of the optimized image (applied to WebP and JPEG images). Default is 80.
DEPRECATED	The following properties still work but are deprecated
containerClassName	Optional className for the image container (a thin wrapper created by React Bricks).
DEPRECATED since 3.3.0 as no wrapper is created anymore. Use renderWrapper instead.
containerStyle	Optional style object to apply to the image container.
DEPRECATED since 3.3.0 as no wrapper is created anymore: use renderWrapper instead.
noWrapper	Optional flag to avoid the wrapping <div> around the image. Default is false.
DEPRECATED since 3.3.0 as no wrapper is created anymore.
Usage with Server Components
When working with Server Components, you need to import from 'react-bricks/rsc':

import { types, Image } from 'react-bricks/rsc'

Repeater
React Bricks allows for infinite nesting of bricks within bricks using the <Repeater> component.

Each Repeater can contain either a single repeatable brick type or multiple types.

Usage example
Let’s consider the following “Button” brick that we want to repeat inside a “TextImage” brick:

Button.tsx
import { types, Link, Text } from 'react-bricks/frontend'
import clsx from 'clsx'

export interface ButtonProps {
  path: string
  buttonText: types.TextValue
}

const Button: types.Brick<ButtonProps> = ({ path, buttonText }) => (
  <div>
    <Link
      href={path}
      className="inline-block text-center font-semibold leading-6 rounded-full px-8 py-3 border text-white bg-indigo-500 hover:bg-indigo-500/90 transition-colors border-indigo-500"
    >
      <Text
        propName="buttonText"
        value={buttonText}
        placeholder="Type a buttonText..."
        renderBlock={({ children }) => <span>{children}</span>}
      />
    </Link>
  </div>
)

Button.schema = {
  name: 'my-button',
  label: 'Button',
  hideFromAddMenu: true,
  getDefaultProps: () => ({
    buttonText: 'Learn more',
  }),
  sideEditProps: [
    { name: 'path', label: 'Path', type: types.SideEditPropType.Text },
  ],
}

export default Button

In our TextImage brick, we need to:

Add a prop in our interface for the repeated buttons
Add a <Repeater> component in the rendered JSX where items should appear
Add the repeaterProps in the brick’s schema to specify the type of brick to be repeated
1. Add a prop in the brick interface:
TextImage.tsx
interface TextImageProps {
  title: types.TextValue
  description: types.TextValue
  image: types.IImageSource
  buttons: types.RepeaterItems<ButtonProps>
}

2. Add the Repeater component:
TextImage.tsx
// ...
<Repeater
  propName="buttons"
  items={buttons}
  renderWrapper={(items) => (
    <div className="flex gap-4 flex-wrap mt-6">{items}</div>
  )}
/>
// ...

3. Add repeaterItems in the schema
TextImage.tsx
TextImage.schema = {
  name: 'text-image',
  label: 'Text Image',
  ...
  repeaterItems: [
    {
      name: 'buttons',
      itemType: 'my-button',
      itemLabel: 'Button',
      max: 2,
    },
  ],
  ...
}

Note that the name buttons is the same for both the Repeater’s propName and the item name in the repeaterItems.

In this example, our Repeater allows only one type of brick to be repeated (my-button). By setting max: 2, we limit the number of buttons that can be added in the repeater.

Tip

It’s advisable for the repeated brick to have a root div element. This allows React Bricks to properly attach focus events to the element.

Repeater Properties
interface RepeaterProps {
  propName: string
  items?: types.RepeaterItems<T>
  itemProps?: types.Props
  renderWrapper?: (items: React.ReactElement) => React.ReactElement
  renderItemWrapper?: (
    item: React.ReactElement,
    index?: number,
    itemsCount?: number
  ) => React.ReactElement
}

Repeater Properties definition
Property	Definition
propName	Name of the prop containing the repeated items (should match the one in the repeaterItems schema property)
items	The value of the prop for this repeater, containing the repeated items. Required for Server Components, but always recommended for RSC compatibility
itemProps?	Optional object with props passed to all the items (e.g., a global configuration shared by all the items).
renderWrapper?	Optional function taking items as an argument. It should return JSX that wraps the items. Rendered only if there is at least one repeated item.
renderItemWrapper?	Optional wrapper around each item. Takes item, index and itemsCount as arguments and should return JSX
The schema’s repeaterItems Property
While there’s a dedicated section in the docs about the bricks’ schema, we’ll include the interface for repeaterItems here due to its close relation to the Repeater component.

repeaterItems?: IRepeaterItem[]

Where IRepeaterItem is defined as:

interface IRepeaterItem {
  name: string
  label?: string
  itemType?: string
  itemLabel?: string
  defaultOpen?: boolean
  min?: number
  max?: number
  positionLabel?: string // DEPRECATED => use "label"
  getDefaultProps?: () => Props
  items?: {
    type: string
    label?: string
    min?: number
    max?: number
    getDefaultProps?: () => Props
  }[]
}

When max is reached, no more blocks can be added to the repeater.
Setting a min ensures that React Bricks always maintains at least that number of blocks (adding items with default values).

RepeaterItem Properties definition
Property	Definition
name	Name of the prop containing the repeated items (e.g., “buttons”)
itemType	Corresponds to the unique name of the repeated Brick type (e.g., “my-button”)
label?	Label for the group of items in this repeater (title of nested items)
itemLabel?	Optional label used for the Add / Remove buttons. If not provided, the repeated brick’s label is used as a fallback
min	Minimum number of repeated items allowed
max	Maximum number of repeated items allowed
getDefaultProps	Function that returns the default props for the repeated brick inside of this brick. For example, for a Button brick repeated inside a Form brick, you could specify that the default type should be “submit” instead of “link”.
items	Allowed item types, when multiple. In this case the main itemType and min are not considered. Each item has its own type, label, min, max and getDefaultProps.
Multiple item types
itemType is used for a single type of brick that can be repeated in a Repeater (e.g. a Thumbnail in a Gallery).
items is used for multiple types of brick in a Reapear (e.g., in a Form you may add “TextInput” blocks or “Select” blocks).
With multiple item types, each with its own min and max, the root item’s min is ignored, while the overall max is still enforced.
Hiding a Repeated Brick from the Brick Selection
Sometimes a brick is designed to be used only within another brick, and you don’t want editors to add it directly to a page as a standalone element. For example, you might have a GalleryImage brick that should only appear inside a Gallery brick.

To prevent such a brick from showing up in the list of available bricks when adding a new block, set hideFromAddMenu: true in the brick’s Schema.

Usage with Server components
When working with Server Components, you need to import from 'react-bricks/rsc':

import { types, Repeater, Text } from 'react-bricks/rsc'

see more in the Server Components documentation.

File
The File component enables content creators to upload files. This feature is particularly useful when you need to include downloadable documents on your page, such as PDF catalogs or terms and conditions. You can specify which file extensions are allowed for each File component.

Usage Example
import { File } from 'react-bricks/frontend'
...

<File
  propName="catalog"
  allowedExtensions={['.pdf']}
  renderBlock={({ name, url, size }) => (
    <a href={url}>
      {name}, {size / 1024} KB
    </a>
  )}
/>

The JSX returned by the render function is displayed on both the frontend and the Editor interface. In the editor, content creators can upload a file by clicking on the rendered JSX. They can also remove a file or provide an SEO-friendly name (enforced via rewrite rules).

You can render different elements on the frontend and admin interface by checking the isAdmin flag.

Properties
Here’s the TypeScript interface for the props of the File component:

interface FileProps {
  propName: string
  source?: types.IFileSource
  renderBlock: (props: types.IFileSource) => JSX.Element
  allowedExtensions?: string[]
}

interface IFileSource {
  name: string // file name
  url: string
  size: number // size in bytes
}

Properties definition
Property	Definition
propName	The prop corresponding to this file.
renderBlock	Render function to render the document on the page. Its argument is an object with name (file name), url, and size (file size in bytes).
allowedExtensions	Array of strings representing the allowed extensions.
Allowed extensions
Allowed extensions must be a subset of the following: .pdf, .bmp, .gif, .jpg, .jpeg, .png, .svg, .tif, .tiff, .webp, .mp4, .txt, .rtf.

Extensions not listed above are not allowed, even if specified in the allowedExtensions array.

Icon
The Icon component isn’t really a visual editing component—rather, it renders an SVG icon that users choose through a sidebar IconSelector control.

The component accepts an icon prop of type Icon, matching what’s returned by an IconSelector sidebar control. By rendering an inline <svg>, it offers both performance (avoiding GET requests) and flexibility. You can customize it with any className, width, height, or other SVG props, and even preprocess the file before rendering.

Usage Example
// Import from 'react-bricks/rsc/client' for Server components
import { Icon } from 'react-bricks/frontend'
...

<Icon
  icon={icon}
  width={32}
  height={32}
  className="text-pink-500 hover:text-pink-700"
  title="My Icon"
  description="Description for my Icon"
  fillOpacity={0.5}
/>

Properties
Here’s the (simplified) TypeScript interface for the props of the Icon component, which inherits all the props of a normal SVG, like className, width, height, etc.:

interface IconProps extends React.SVGProps<SVGElement> {
  icon: types.Icon
  description?: string
  preProcessor?: (code: string) => string
  title?: string | null
}

Properties definition
Property	Definition
icon	The icon object of type Icon, typically set by a sideEditProp of type IconSelector.
description	Optional description. It will override an existing <desc> tag
preProcessor	A function to process the contents of the SVG text before parsing.
title	Optional title. It will override an existing <title> tag. If null is passed, the <title> tag will be removed.
Preprocessor example
Here’s an example of using preProcessor to process the SVG content.

preProcessor={(code) => code.replace(/fill=".*?"/g, 'fill="currentColor"')}

In case of icons from an IconSelector the previous code would not be needed, as icons have already fill="currentColor" for any path.

The Link component
The Link component simplifies the management of links, both standalone and within RichText fields.

When you enable Links in a RichText without customizing the render function, a Link component is automatically used to render links.

Link Component vs. Standard Anchor
The Link component utilizes the framework’s Link (e.g., Next.js Link) for local paths, while rendering a standard <a> tag for absolute URLs
In the Editor interface, the Link component doesn’t trigger a link when clicked, allowing easy text editing within a link using a <Text> component.
Standalone Usage Example
Button.tsx
import { Text, Link, types } from 'react-bricks/frontend'

interface ButtonProps {
  buttonText: types.TextValue
  buttonPath: string
}

const Button: types.Brick<ButtonProps> = ({ buttonText, buttonPath }) => {
  return (
    <Link
      href={buttonPath}
      className="py-2 px-6 text-white text-center bg-sky-500"
    >
      <Text
        propName="buttonText"
        value={buttonText}
        placeholder="Action"
        renderBlock={({ children }) => <span>{children}</span>}
      />
    </Link>
  )
}

Button.schema = {
  name: 'button',
  label: 'Button',

  getDefaultProps: () => ({
    buttonText: 'Learn more',
  }),

  sideEditProps: [
    {
      name: 'buttonPath',
      label: 'Path or URL',
      type: types.SideEditPropType.Text,
      validate: (value) =>
        value?.startsWith('/') ||
        value?.startsWith('https://') ||
        'Please, enter a valid URL',
    },
  ],
}

export default Button

Usage inside a RichText
import { Link } from 'react-bricks/frontend'

// ...
<RichText
  propName="description"
  value={description}
  renderBlock={({ children }) => (
    <p className="text-lg text-gray-500">{children}</p>
  )}
  placeholder="Type a description"
  allowedFeatures={[types.RichTextFeatures.Link]}
  renderLink={({ children, href, target, rel }) => (
    <Link
      href={href}
      target={target}
      rel={rel}
      className="text-sky-500 hover:text-sky-600 transition-colors"
    >
      {children}
    </Link>
  )}
/>

When editors opt to open a link in a new tab through the link popup interface, the attributes target="_blank" and rel="noopener" are automatically applied.

Properties
interface LinkProps {
  href: string
  target?: string
  rel?: string
  className?: string
}

Properties Definition
Property	Definition
href	The URL for an external link or the local path for a local link.
target	The target for the external link (for example “_blank”).
rel	The “rel” for the external link (for example “noopener”).
className	CSS class to be applied to the link tag.
The Link component also spreads {...rest} properties on the link tag or framework’s Link component.

Usage with Server Components
When working with Server Components, you need to import from 'react-bricks/rsc':

import { types, Link, RichText } from 'react-bricks/rsc'

usePagePublic
The usePagePublic hook lets you easily retrieve the content of a page from React Bricks’ APIs.

Signature
const usePagePublic = (
  slug: string,
  language?: string
): types.IQueryResult<types.Page>

Usage example
See PageViewer example with usePage

useVisualEdit
Custom Visual editing components
Sometimes you may want to add new visual editing components beyond the predefined Text, RichText, Image, or File.

For instance, you might want to create a code editor (like the one found in React Bricks UI blocks) or a canvas where editors can draw.

The useVisualEdit hook allows you to create a custom visual editing component that reads from a block property and saves back to that property.

Usage Example
const [value, setValue, isReadOnly] = useVisualEdit('my-prop')

if (isReadOnly) {
  // Here we are on the frontend
  return (
    <div>{value}</div>
  )
}

// Here we are in the content administration interface
return (
  <MyEditorComponent value={value} onChange={setValue}>
)

Hook Definition
const useVisualEdit = (
  propName: string
): [any, (value: any) => void, boolean]

The useVisualEdit hook takes a propName as argument and returns a [value, setValue, isReadOnly] array.

You can use value, setValue, and isReadOnly to create your editing component:

value is the value of the prop
setValue function that accepts a value as argument and sets the prop accordingly
isReadOnly is true in the frontend and Preview mode, while false in the Admin Editor

usePagesPublic
Hook to fetch the list of published pages.
It won’t return pages with status “DRAFT”.

Arguments
The usePagesPublic hook accepts an optional configuration object with the following props:

{
  type?: string
  types?: string[]
  tag?: string
  language?: string
  usePagination?: boolean
  page?: number
  pageSize?: number
  sort?: string
  filterBy?: { [key: string]: any}
}

Property	Definition
type	Optional string to return only the pages with the specified page type.
types	Optional array of strings to return only the pages with one of the specified page types.
tag	Optional string to return only the pages with the specified tag.
language	Optional language for the page. If not specified, the default language will be used.
usePagination	If true, it will consider the page and pageSize parameters and it will return paginated results
page	The page number, in case of pagination
pageSize	The page size, in case of pagination
sort	Sort parameter: currently it accepts only createdAt,-createdAt,publishedAt,-publishedAt
filterBy	Used to filter by a custom field. The object should have a key for each field and the value that it should have (or an array of possible values). The queries on the fields are in logical AND. For example: { category: 'shoes', subcategory: ['snickers', 'running'] }. At the moment you cannot filter using a complex type (like an object) for the value, so really now it should be string or string[] }
Return value
The hook returns an object with { data, error, isFetching } and other properties.

data contains:

When usePagination is false, an array of type PageFromList
When usePagination is true, an object of type PagesFromListWithPagination
Usage example
const { data, error, isFetching } = usePages()

const { data, error, isFetching } = usePages({
  type: 'products',
  usePagination: true,
  pageSize: 20,
  page: 1,
})

useTagsPublic
The useTagsPublic hook lets you easily retrieve all the Tags from React Bricks’ APIs.

Signature
const useTagsPublic: (
  page?: number,
  pageSize?: number
) => types.IQueryResult<{
  items: string[]
  pagination: {
    page: number
    pageSize: number
    totalItems: number
    totalPages: number
  }
}>

Usage example
import React from 'react'
import { useTagsPublic } from 'react-bricks/frontend'

const MyBrick: types.Brick = () => {
  const { data } = useTagsPublic()

  return (
    <div>
      {data?.items?.map((t) => (
        <span key={t} className="p-2 bg-gray-100 rounded mr-2">
          {t}
        </span>
      ))}
    </div>
  )
}

MyBrick.schema = {
  name: 'my-brick',
  ...
}

export default MyBrick

useAuth
Hook with no arguments that returns two authentication functions used internally by React Bricks to execute the login and logout.

When using React Bricks admin components, there should be no need to call this from your code.

Example usage
const { loginUser, logoutUser } = useAuth()

loginUser
Function with the following signature:

const loginUser: (email: string, password: string) => Promise<any>

Example usage
const { loginUser } = useAuth()

const handleLogin = (event: React.FormEvent) => {
  event.preventDefault()
  loginUser(email, password).then(
    () => navigate(editorPath),
    (error) => {
      setError(error)
    }
  )
}

logoutUser
Function with the following signature:

const logoutUser: () => void

Example usage
const { logoutUser } = useAuth()
return <button onClick={() => logoutUser()}>Logout</button>

usePageValues
The usePageValues hook allows you to access and modify page meta values within your bricks.

Usage Example
// The returned array contains the Page values and a setter function
const [page, setPage] = usePageValues()

return (
  <div>
    {/* Access the page creation date */}
    <p>Created at {moment(page.createdAt).format('MM/DD/YYYY')}.</p>

    {/* Access the page title */}
    <p>Page title: {page.meta.title}</p>

    {/* Access a custom field's value */}
    <p>Page title: {page.customValues.productId}</p>
  </div>
)

Hook Signature
const usePageValues = (): [
  types.PageValues,
  (pageData: types.PartialPage) => void
]

The usePageValues is called without arguments.

It returns an array containing the page values and a setter function: [pageValues, setPageValues].

pageValues is an object with the structure shown below
setPageValues is a function to set the values (merging the object one level deep).
Note

On the frontend site, the setPage function has no effect.

Returned Values
The returned object has the following structure:

type PageValues = {
  id: string
  type: string
  name: string
  slug: string
  meta: IMeta
  customValues?: Props
  externalData?: Props
  authorId?: string
  author: Author
  status: PageStatus
  editStatus: EditStatus
  isLocked: boolean
  tags: string[]
  category?: string
  createdAt: string
  publishedAt?: string
  scheduledForPublishingOn?: string
  language: string
  translations: Translation[]
  lastEditedBy: LastEditedBy
}

For more details, refer to the following type definitions:

Page
IMeta
Props
Author
PageStatus
EditStatus
Translation
LastEditedBy

useReactBricksContext
const useReactBricksContext = (): types.IReactBricksContext

Hook with no arguments to access the values in ReactBricksContext. It returns an object. The values in the returned object are from the configuration you provided to the ReactBricks component, so you should have them available in your project, but this hook could be useful to access them from any component wrapped by ReactBricks, for example a content block.

Example usage
const { bricks } = useReactBricksContext()

ReactBricksContext
The ReactBricksContext provides configuration context to all the children components.

It has the following TypeScript interface:

interface IReactBricksContext {
  version: string
  appId: string
  apiKey: string
  bricks: Bricks
  themes: types.Theme[]
  pageTypes: IPageType[]
  logo: string
  loginUI: LoginUI
  contentClassName: string
  defaultTheme: string
  renderLocalLink: RenderLocalLink
  navigate: (path: string) => void
  loginPath: string
  editorPath: string
  playgroundPath: string
  appSettingsPath: string
  previewPath: string
  getAdminMenu?: (args: { isAdmin: boolean }) => IMenuItem[]
  isDarkColorMode?: boolean
  toggleColorMode?: () => void
  useCssInJs?: boolean
  appRootElement: string | HTMLElement
  clickToEditSide?: ClickToEditSide
  customFields?: Array<ISideEditPropPage | ISideGroup>
  responsiveBreakpoints: ResponsiveBreakpoint[]
  enableAutoSave: boolean
  disableSaveIfInvalidProps: boolean
  enablePreview: boolean
  browserSupport: { webP: boolean; lazyLoading: boolean }
  blockIconsPosition: BlockIconsPosition
  enablePreviewImage: boolean
  enablePreviewIcon: boolean
  enableUnsplash: boolean
  unsplashApiKey?: string
  enableDefaultEmbedBrick: boolean
  permissions?: Permissions
}

The <ReactBricks> component wraps all the children with the ReactBricksContext Provider.

useAdminContext
const useAdminContext = (): types.IReadAdminContext

Hook with no arguments to access some useful values from the AdminContext. It returns an object.

Example usage
const { isAdmin, previewMode } = useAdminContext()

AdminContext
The AdminContext provides the context needed by the admin editing interface.

The useAdminContext returned object has the following interface

interface IReadAdminContext {
  isAdmin: boolean
  previewMode: boolean
}

isAdmin is true in the Admin interface and false on the public front-end.
previewMode is true when the Full-screen preview is active in the Admin interface and false otherwise.
The <Admin> component wraps all the children with the AdminContext Provider.

fetchPage
The fetchPage function is useful when you want to retrieve the content of one page from outside the React context (where you could use the usePagePublic hook instead).

In particular, this comes in handy during the build process of a static website. Indeed, this is the method used in our Gatsby and Next.js starter projects.

Signature
const fetchPage = async (
  slug: string,
  apiKey: string,
  language?: string
  pageTypes?: types.IPageType[]
): Promise<types.Page>

Property	Definition
pageSlug	The slug (string) of the page to fetch.
apiKey	Api Key of your React Bricks app (a string).
language?	The language of the desired translation for the page, if more than one share the same slug
pageTypes?	The pageTypes used in React Bricks configuration. Useful only if you have external content (fetchPage cannot access them from the React context).
Return value
fetchPage returns a promise which resolves to a Page

Before using this page with ReactBricks’ PageViewer component, you need to parse it with the cleanPage function.

Usage example
fetchPage('about-us', 'API_KEY').then((data) => {
  const myPage = cleanPage(data, pageTypes, bricks)
  console.log(myPage.content)
})

fetchPages
The fetchPages function is useful when you want to retrieve all your pages from outside the React context (where you could use the usePagesPublic hook instead).

In particular, this comes in handy to retrieve all the pages during the build process of a static website. Indeed, this is the method used in our Gatsby and Next.js starter projects.

Signature (simplified)
const fetchPages = async (
  apiKey: string,
  options: {...}
): Promise<types.PageFromList[] | types.PagesFromListWithPagination>

Property	Definition
apiKey	Api Key of your React Bricks app (a string).
options	Optional object to filter the pages (see below).
Options
The options object has the following shape

{
  type?: string
  types?: string[]
  tag?: string
  language?: string
  usePagination?: boolean
  page?: number
  pageSize?: number
  sort?: string
  filterBy?: { [key: string]: any}
}

Property	Definition
type	Optional string to return only the pages with the specified page type.
types	Optional array of strings to return only the pages with one of the specified page types.
tag	Optional string to return only the pages with the specified tag.
language	Optional string to return only the pages with the specified language.
usePagination	If true, it will consider the page and pageSize parameters and it will return paginated results
page	The page number, in case of pagination
pageSize	The page size, in case of pagination
sort	Sort parameter: currently it accepts only createdAt,-createdAt,publishedAt,-publishedAt
filterBy	Used to filter by a custom field. The object should have a key for each field and the value that it should have (or an array of possible values). The queries on the fields are in logical AND. For example: { category: 'shoes', subcategory: ['snickers', 'running'] }. At the moment you cannot filter using a complex type (like an object) for the value, so really now it should be string or string[] }
Return value
fetchPages returns a promise which resolves to.

When usePagination is false, an array of type PageFromList
When usePagination is true, an object of type PagesFromListWithPagination
To retrieve the content of each page, you can use the fetchPage function.

Usage example
fetchPages('API_KEY', { type: 'blogPost', tag: 'react' }).then((data) => {
  console.log(data)
})

fetchTags
The fetchPages function is useful when you want to retrieve all your tags from outside the React context (where you could use the useTagsPublic hook instead).

In particular, this comes in handy to retrieve all the tags during the build process of a static website.

Signature
const fetchTags = async (
  apiKey: string,
  page: number = 1,
  pageSize: number = 100
): Promise<{
  items: string[]
  pagination: {
    page: number
    pageSize: number
    totalItems: number
    totalPages: number
  }
}>

Property	Definition
apiKey	Api Key of your React Bricks app (a string).
page	Pagination’s Page number
pageSize	Pagination’s Page size
Usage example
import { fetchTags } from 'react-bricks/frontend'
import config from '../react-bricks/config'

const paginatedTags = await fetchTags(config.apiKey)

cleanPage
The cleanPage function prepares the page content retrieved by React Bricks APIs to be used in the PageViewer component.

It removes all the invalid blocks (unknown in the schema or not allowed for this page type).

Signature
const cleanPage = (
  page: types.Page,
  pageTypes: types.IPageType[],
  bricks: types.Bricks
): types.Page

Property	Definition
page	The page object, of type Page.
pageTypes	The pageType schema, of type IPageType[], as defined here.
bricks	The block’s schema, of type IBlockType[], as defined here.
Return value
cleanPage returns an object of type Page, with the clean content and the invalidBlocksTypes array containing the name of each invalid block that was removed.

Usage example
fetchPage('about-us', 'API_KEY').then((data) => {
  const myPage = cleanPage(data, pageTypes, bricks)
  console.log(myPage.content)
})

getPagePlainText
Given a Page content (of type IContentBlock[]), this function returns an array of plain text strings with all the texts found in the page.

It could be useful for page content indexing.

Plain
Plain text serializer / deserializer for a (Rich)Text value.

It has the deserialize method to convert a string into an editor value and the serialize method which does the opposite.

It is exported for compatibility and convenience, but there should be no use case for a user to directly call this two methods.

markPluginConstructor
As we saw, the RichTextExt can be extended using a plugin system.

For a typical Mark plugin (bold, italic, highlight…), React Bricks provides the markPluginConstructor helper that allows you to create a new plugin very quickly.

It just accepts a simple MarkPlugin object:

type MarkPluginConstructor = (markPlugin: MarkPlugin) => RichTextPlugin

interface MarkPlugin {
  name: string
  label?: string
  hotKey?: string
  render: (props: RenderLeafProps) => JSX.Element
  icon: React.ReactElement
}

For the meaning of the arguments, you can see the interface for a RichTextPlugin. The icon is the button’s icon.

Usage example
Here’s the code for React Bricks bold plugin, created using the markPluginConstructor

import React from 'react'
import { FaBold } from 'react-icons/fa'
import { markPluginConstructor } from 'react-bricks/frontend'

const plugin = markPluginConstructor({
  name: 'bold',
  hotKey: 'mod+b',
  render: (props: any) => <strong>{props.children}</strong>,
  icon: <FaBold />,
})

export default plugin

blockPluginConstructor
As we saw, the RichTextExt can be extended using a plugin system.

For a typical Block or List plugin (heading, quote, unordered list…), React Bricks provides the blockPluginConstructor helper that allows you to create a new plugin very quickly.

It just accepts a simple BlockPlugin object:

type BlockPluginConstructor = (blockPlugin: BlockPlugin) => RichTextPlugin

interface BlockPlugin {
  name: string
  isInline?: boolean
  itemName?: string
  label?: string
  hotKey?: string
  render: (props: RenderElementProps) => JSX.Element
  renderItem?: (props: RenderElementProps) => JSX.Element
  icon: React.ReactElement
}

For the meaning of the arguments, you can see the interface for a RichTextPlugin. The icon is the button’s icon. If you set an itemName React Bricks will create a List plugin, otherwise a Block one.

Usage example
Here’s the code for React Bricks h1 plugin, created using the blockPluginConstructor

import React from 'react'
import { MdLooksOne } from 'react-icons/md'

import { blockPluginConstructor } from 'react-bricks/frontend'

const plugin = blockPluginConstructor({
  name: 'h1',
  hotKey: 'mod+shift+1',
  render: (props: any) => <h1>{props.children}</h1>,
  icon: <MdLooksOne />,
})

export default plugin

blockWithModalPluginConstructor
As we saw, the RichTextExt can be extended using a plugin system.

The blockPluginConstructor helper is meant to create an advanced plugin, which needs parameters configured through a modal interface.

It accepts a BlockWithModalPlugin object:

type BlockPluginConstructor = (
  blockPlugin: BlockWithModalPlugin
) => RichTextPlugin

interface BlockWithModalPlugin {
  name: string
  isInline?: boolean
  itemName?: string
  label?: string
  hotKey?: string
  render: (props: RenderElementProps) => JSX.Element
  renderItem?: (props: RenderElementProps) => JSX.Element
  icon: React.ReactElement
  // highlight-next-line
  pluginCustomFields: Array<types.ISideEditPropPage | types.ISideGroup>
  // highlight-next-line
  getDefaultProps?: () => Props
  // highlight-next-line
  renderAdmin?: (props: RenderElementProps) => JSX.Element
  // highlight-next-line
  renderItemAdmin?: (props: RenderElementProps) => JSX.Element
}

As you can see, it’s like a BlockPlugin, but for the highlighted props:

pluginCustomFields: the array of custom fields the plugin needs. The interface is the same used for sidebar controls of a brick. See SideEditProps.
getDefaultProps: function that returns the default values for the custom fields.
renderAdmin: what should be rendered on the Admin interface (sometimes it may be useful to render something different from the frontend in the Admin interface)
renderItemAdmin: the renderItem function to render an item on the Admin interface.
Usage example
Here’s the code for a custom “stock quote” plugin, created using the blockPluginConstructor:

import React from 'react'
import { MdLooksOne } from 'react-icons/md'

import { blockPluginConstructor } from 'react-bricks/frontend' // or 'react-bricks/rsc

const plugin = blockWithModalPluginConstructor({
  name: 'stockQuote',
  label: 'Stock quote',
  isInline: true,
  hotKey: 'mod+k',
  icon: <FaChartLine />,
  render: (props) => (
    <span>
      {props.children} {renderStockData(props.element?.data)}
      // renderStockData renders the stock value, not relevant here
    </span>
  ),
  renderAdmin: (props) => (
    <strong className="border-b border-dashed border-blue-500">
      {props.children || 'STOCK'} {renderStockData(props.element?.data)}
    </strong>
  ),
  getDefaultProps: () => {
    return {
      stockCode: {},
      type: 'c',
    }
  },
  pluginCustomFields: [
    {
      name: 'stockCode',
      label: 'Stock code',
      type: types.SideEditPropType.Autocomplete,
      autocompleteOptions: {
        getOptions: async (input) => {
          if (!input) {
            return []
          }
          return fetch(
            `https://finnhub.io/api/v1/search?q=${input}&token=cmpac5hr01qg7bbo20r0cmpac5hr01qg7bbo20rg`,
            {
              next: {
                revalidate: 10,
              },
            }
          )
            .then((res) => res.json())
            .then((data) => data.result)
        },
        getKey: (option) => option?.symbol,
        getLabel: (option) =>
          option?.displaySymbol
            ? `${option?.description} (${option?.displaySymbol})`
            : '',
        getNoOptionsMessage: (input) => `No stocks for "${input}"`,
        debounceTime: 200,
      },
    },
    {
      name: 'type',
      label: 'Data Type',
      type: types.SideEditPropType.Select,
      selectOptions: {
        display: types.OptionsDisplay.Select,
        options: [
          { label: 'Value', value: 'c' },
          { label: 'Daily change', value: 'd' },
          { label: 'Daily change %', value: 'dp' },
        ],
      },
    },
  ],
})

export default plugin

Enums
SideEditPropType
enum SideEditPropType {
  Text = 'TEXT',
  Textarea = 'TEXTAREA',
  Number = 'NUMBER',
  Date = 'DATE',
  Range = 'RANGE',
  Boolean = 'BOOLEAN',
  Select = 'SELECT',
  Autocomplete = 'AUTOCOMPLETE',
  Image = 'IMAGE',
  Custom = 'CUSTOM',
  Relationship = 'RELATIONSHIP',
  IconSelector = 'ICON-SELECTOR',
}

OptionsDisplay
enum OptionsDisplay {
  Select = 'SELECT',
  Radio = 'RADIO',
  Color = 'COLOR',
}

RichTextFeatures
enum RichTextFeatures {
  Bold = 'BOLD',
  Italic = 'ITALIC',
  Code = 'CODE',
  Highlight = 'HIGHLIGHT',
  Subscript = 'SUB',
  Superscript = 'SUP',
  Link = 'LINK',
  UnorderedList = 'UL',
  OrderedList = 'OL',
  Heading1 = 'H1',
  Heading2 = 'H2',
  Heading3 = 'H3',
  Heading4 = 'H4',
  Heading5 = 'H5',
  Heading6 = 'H6',
  Quote = 'QUOTE',
}

IconSets
enum IconSets {
  HeroIconSolid = 'hi-solid',
  HeroIconOutline = 'hi-outline',
  FontAwesome = 'fa6',
  Feather = 'fi',
}

PageStatus
export enum PageStatus {
  Draft = 'DRAFT',
  Published = 'PUBLISHED',
}

EditStatus
enum EditStatus {
  Merged = 'MERGED',
  Working = 'WORKING',
  MergeRequested = 'MERGE_REQUESTED',
}

PlaygroundSelectedItemType
export enum PlaygroundSelectedItemType {
  Block = 'BLOCK',
  PageType = 'PAGE-TYPE',
}

DeviceType
enum DeviceType {
  Desktop = 'DESKTOP',
  Tablet = 'TABLET',
  Phone = 'PHONE',
}

ClickToEditSide
enum ClickToEditSide {
  BottomRight = 'BOTTOM-RIGHT',
  BottomLeft = 'BOTTOM-LEFT',
  TopRight = 'TOP-RIGHT',
  TopLeft = 'TOP-LEFT',
  None = 'NONE',
}

BlockIconsPosition
enum BlockIconsPosition {
  InsideBlock = 'INSIDE-BLOCK',
  OutsideBlock = 'OUTSIDE-BLOCK',
}

Types
Author
type Author = {
  id: string
  email: string
  firstName: string
  lastName: string
  avatarUrl?: string
  company?: string
}

BlockPluginConstructor
type BlockPluginConstructor = (blockPlugin: BlockPlugin) => RichTextPlugin

Brick
type Brick<T = {}> = React.FC<T> & { schema: IBlockType<T> }

Bricks
type Bricks = { [key: string]: Brick<any> }

BrickStory
type BrickStory<T = Props> = {
  id: string
  name: string
  showAsBrick?: boolean
  previewImageUrl?: string
  props: T
}

Category
type type Category = {
  categoryName: string
  bricks: Brick<any>[]
}

CustomRole
type CustomRole = {
  id: string
  name: string
}

EditingUser
type EditingUser = {
  id: string
  email: string
  firstName: string
  lastName: string
  company: string
  avatarUrl?: string
}

Icon
type Icon = {
  name: string
  svg: string
  url: string
  set: string
}

Language
type Language = {
  code: string
  name: string
}

LastEditedBy
type LastEditedBy = {
  date: string
  user: EditingUser
}

MarkPluginConstructor
type MarkPluginConstructor = (markPlugin: MarkPlugin) => RichTextPlugin

Page
type Page = {
  id: string
  type: string
  name: string
  slug: string
  meta: IMeta
  customValues?: Props
  externalData?: Props
  content: IContentBlock[]
  workingContent?: IContentBlock[]
  committedContent?: IContentBlock[]
  authorId?: string
  author: Author
  invalidBlocksTypes?: string[]
  status: PageStatus
  editStatus: EditStatus
  isLocked: boolean
  tags: string[]
  category?: string
  createdAt: string
  publishedAt?: string
  scheduledForPublishingOn?: string
  language: string
  translations: Translation[]
  lastEditedBy: LastEditedBy
}

PageFromList
type PageFromList = Omit<Page, 'content'>

PageFromListWithPagination
export type PagesFromListWithPagination = {
  items: PageFromList[]
  pagination: {
    page: number
    pageSize: number
    totalItems: number
    totalPages: number
  }
}

PageValues
type PageValues = Omit<Page, 'content'>

PartialPage
type PartialPage = Partial<Page>

Permission
type Permission = {
  canAddPage?: (user: PermissionUser, pageType: string) => boolean
  canAddTranslation?: (
    user: PermissionUser,
    pageType: string,
    language: string
  ) => boolean
  canSeePageType?: (user: PermissionUser, pageType: string) => boolean
  canSeePage?: (
    user: PermissionUser,
    page: Omit<PermissionPage, 'language'>
  ) => boolean
  canEditPage?: (user: PermissionUser, page: PermissionPage) => boolean
  canDeletePage?: (
    user: PermissionUser,
    page: Omit<PermissionPage, 'language'>
  ) => boolean
  canDeleteTranslation?: (user: PermissionUser, page: PermissionPage) => boolean
  canUseBrick?: (user: PermissionUser, brick: PermissionBrick) => boolean
}

PermissionBrick
type PermissionBrick = {
  name: string
  category: string
  theme: string
  tags: string[]
}

PermissionPage
type PermissionPage = {
  slug: string
  pageType: string
  language: string
}

PermissionUser
type PermissionUser = {
  firstName: string
  lastName: string
  email: string
  isAdmin: boolean
  role: string
  customRole?: CustomRole
}

Props
type Props = { [key: string]: any }

RenderLocalLink
type RenderLocalLink = ({
  href,
  target,
  className,
  activeClassName,
  isAdmin,
  children,
}: {
  href: string
  target?: string
  className?: string
  activeClassName?: string
  isAdmin?: boolean
  children: React.ReactNode
}) => React.ReactElement

RepeaterItems
type RepeaterItemDefault = IContentBlock | Omit<IContentBlock, 'id'> | Props
type RepeaterItems<T = RepeaterItemDefault> = Array<T>

Translation
type Translation = {
  language: string
  slug: string
  name: string
  status: PageStatus
  editStatus: EditStatus
  isLocked: boolean
  scheduledForPublishingOn: string
}

Theme
type Theme = {
  themeName: string
  categories: Category[]
}

TemplateSlot
type TemplateSlot = {
  slotName: string
  label: string
  min?: number
  max?: number
  allowedBlockTypes?: string[]
  excludedBlockTypes?: string[]
  editable?: boolean
  getDefaultContent?: () => (string | IBrickStory | IContentBlock)[]
}

User
type User = {
  id: string
  email: string
  firstName: string
  lastName: string
  company: string
  avatarUrl?: string
  isAdmin: boolean
  token: string
  appName: string
  appId: string
  appEnv: string
  deployHookUrl?: string
  deployHookMethod?: string
  deployHookTriggerOnScheduledPublishing: boolean
  deployHookStagingUrl?: string
  deployHookStagingMethod?: string
  deployHookStagingTriggerOnScheduledPublishing: boolean
  deployHookDevUrl?: string
  deployHookDevMethod?: string
  deployHookDevTriggerOnScheduledPublishing: boolean
  eventsHookUrl?: string
  eventsHookAuthToken?: string
  canCreatePage: boolean
  canDeletePage: boolean
  canDeploy: boolean
  canDeployStaging: boolean
  canDeployDev: boolean
  canEditPageAttributes: boolean // add to dashboard
  canEditSeo: boolean // add to dashboard
  canApprove: boolean // add to dashboard
  role: string
  customRole?: CustomRole
  plan: string
  isVerified: boolean
  languages: Language[]
  defaultLanguage: string
  hostname: string
  useWorkingCopy: boolean
  useApprovalWorkflow: boolean
} | null

Interfaces
FetchPagesType
interface FetchPagesType {
  <T extends boolean>(
    apiKey: string,
    {
      type,
      types,
      tag,
      language,
      page,
      pageSize,
      sort,
      filterBy,
      usePagination,
    }: {
      type?: string
      types?: string[]
      tag?: string
      language?: string
      page?: number
      pageSize?: number
      sort?: string
      filterBy?: { [key: string]: any }
      usePagination: T
    }
  ): Promise<T extends true ? PagesFromListWithPagination : PageFromList[]>
  (
    apiKey: string,
    {
      type,
      types,
      tag,
      language,
      page,
      pageSize,
      sort,
      filterBy,
    }: {
      type?: string
      types?: string[]
      tag?: string
      language?: string
      page?: number
      pageSize?: number
      sort?: string
      filterBy?: { [key: string]: any }
    }
  ): Promise<PageFromList[]>
  (apiKey: string): Promise<PageFromList[]>
}

IBlockType
interface IBlockType<T = Props> {
  name: string
  label: string
  getDefaultProps?: () => Partial<T>
  hideFromAddMenu?: boolean
  sideEditProps?: Array<ISideEditProp<T> | ISideGroup<T>>
  repeaterItems?: IRepeaterItem[]
  newItemMenuOpen?: boolean
  groupByRepeater?: boolean
  mapExternalDataToProps?: (externalData: Props, brickProps?: T) => Partial<T>
  getData?: (page: Page, brickProps?: T, args?: any) => Promise<Partial<T>>
  getExternalData?: (
    page: Page,
    brickProps?: T,
    args?: any
  ) => Promise<Partial<T>>
  playgroundLinkUrl?: string
  playgroundLinkLabel?: string
  theme?: string
  category?: string
  tags?: string[]
  previewImageUrl?: string
  previewIcon?: React.ReactElement
  stories?: BrickStory<Partial<T>>[]
}

IBrickStory
interface IBrickStory {
  brickName: string
  storyName: string
  locked?: boolean
  canAddAfter?: boolean
  canAddBefore?: boolean
}

ICategory
interface ICategory {
  category?: string
}

ICleanBlocks
interface ICleanBlocks {
  blocks: IContentBlock[]
  invalidBlocksTypes: string[]
}

IColor
interface IColor {
  color: string
  [propName: string]: any
}

IContentBlock
interface IContentBlock {
  id: string
  type: string
  props: Props
  locked?: boolean
  canAddAfter?: boolean
  canAddBefore?: boolean
  canEditContent?: boolean
}

ICustomKnobProps
interface ICustomKnobProps {
  id: string
  value: any
  onChange: any
  isValid: boolean
  errorMessage?: string
}

IFileSource
interface IFileSource {
  name: string
  url: string
  size: number
  extension: string
  pagesNum: number
  title?: string | undefined
  alt?: string | undefined
  copyright?: string | undefined
  source?: string | undefined
}

IImageSource
interface IImageSource {
  src: string
  srcSet?: string
  type?: string
  fallbackSrc?: string
  fallbackSrcSet?: string
  fallbackType?: string
  placeholderSrc?: string
  alt?: string
  seoName?: string
  width?: number
  height?: number
  highPriority?: boolean
  hashId?: string
  crop?: ICrop
  transform?: ITransform
}

ITransform
interface ITransform {
  rotate?: number
  flip?: {
    horizontal: boolean
    vertical: boolean
  }
}

ICrop
interface ITransform {
  rotate?: number
  flip?: {
    horizontal: boolean
    vertical: boolean
  }
}

IMenuItem
interface IMenuItem {
  label: string
  path?: string
}

IMeta
interface IMeta extends MetaData {
  language?: string
  openGraph?: OpenGraphData
  twitterCard?: TwitterCardData
  schemaOrg?: SchemaOrgData
}

IOption
interface IOption {
  value: any
  label: string
}

IPageType
interface IPageType {
  name: string
  pluralName: string
  isEntity?: boolean
  headlessView?: boolean
  allowedBlockTypes?: string[]
  excludedBlockTypes?: string[]
  defaultLocked?: boolean
  defaultStatus?: PageStatus
  defaultFeaturedImage?: string
  getDefaultContent?: () => (string | IBrickStory | IContentBlock)[]
  customFields?: Array<ISideEditPropPage | ISideGroup>
  getExternalData?: (page: Page, args?: any) => Promise<Props>
  getDefaultMeta?: (page: PageFromList, externalData: Props) => Partial<IMeta>
  metaImageAspectRatio?: number
  categories?: ICategory[]
  slugPrefix?: ISlugPrefix
  template?: Array<TemplateSlot>
}

IReactBricksContext
interface IReactBricksContext {
  version: string
  appId: string
  apiKey: string
  environment?: string
  bricks: Bricks
  themes: types.Theme[]
  pageTypes: IPageType[]
  logo: string
  loginUI: LoginUI
  contentClassName: string
  defaultTheme: string
  renderLocalLink: RenderLocalLink
  navigate: (path: string) => void
  loginPath: string
  editorPath: string
  mediaLibraryPath: string
  playgroundPath: string
  appSettingsPath: string
  previewPath: string
  getAdminMenu?: (args: { isAdmin: boolean }) => IMenuItem[]
  isDarkColorMode?: boolean
  toggleColorMode?: () => void
  useCssInJs?: boolean
  appRootElement: string | HTMLElement
  clickToEditSide?: ClickToEditSide
  customFields?: Array<ISideEditPropPage | ISideGroup>
  responsiveBreakpoints: ResponsiveBreakpoint[]
  enableAutoSave: boolean
  disableSaveIfInvalidProps: boolean
  enablePreview: boolean
  browserSupport: { webP: boolean; lazyLoading: boolean }
  blockIconsPosition: BlockIconsPosition
  enablePreviewImage: boolean
  enablePreviewIcon: boolean
  enableUnsplash: boolean
  unsplashApiKey?: string
  enableDefaultEmbedBrick: boolean
  permissions?: Permissions
  allowAccentsInSlugs: boolean
}

IReadAdminContext
interface IReadAdminContext {
  isAdmin: boolean
  previewMode: boolean
  currentPage: ICurrentPage
  showRichTextModal: ShowRichTextModal
}

IRepeaterItem
interface IRepeaterItem {
  name: string
  label?: string
  itemType?: string
  itemLabel?: string
  defaultOpen?: boolean
  min?: number
  max?: number
  positionLabel?: string // DEPRECATED => Now use "label"
  getDefaultProps?: () => Props
  items?: {
    type: string
    label?: string
    min?: number
    max?: number
    getDefaultProps?: () => Props
  }[]
}

ISideEditProp
interface ISideEditPropPage<T = Props> {
  name: string
  label: string
  type: SideEditPropType
  component?: React.FC<ICustomKnobProps>
  validate?: (value: any, props?: T) => boolean | string
  show?: (props: T, page?: Page, user?: User) => boolean
  helperText?: string

  textareaOptions?: {
    height?: number
  }
  imageOptions?: {
    maxWidth?: number
    quality?: number
    aspectRatio?: number
  }
  rangeOptions?: {
    min?: number
    max?: number
    step?: number
  }
  selectOptions?: {
    options?: IOption[]
    getOptions?: (props: Props) => IOption[] | Promise<IOption[]>
    display: OptionsDisplay
  }
  autocompleteOptions?: {
    placeholder?: string
    getOptions: (input: string, props: Props) => any[] | Promise<any[]>
    getKey: (option: any) => string | number
    getLabel: (option: any) => string
    renderOption?: ({
      option,
      selected,
      focus,
    }: {
      option: any
      selected: boolean
      focus: boolean
    }) => React.ReactElement
    debounceTime?: number
    getNoOptionsMessage?: (input?: string) => string
  }
  iconSelectorOptions?: {
    iconSets?: IconSets[]
  }
  relationshipOptions?: {
    label?: string
    references: string
    multiple: boolean
    embedValues?: boolean
  }
}

ISideGroup
interface ISideGroup {
  groupName: string
  defaultOpen?: boolean
  show?: (props: Props) => boolean
  props: ISideEditProp[]
}

LoginUI
interface LoginUI {
  sideImage?: string
  logo?: string
  logoWidth?: number
  logoHeight?: number
  welcomeText?: string
  welcomeTextStyle?: React.CSSProperties
}

ReactBricksConfig
interface ReactBricksConfig {
  appId: string
  apiKey: string
  environment?: string
  bricks?: types.Brick<any>[] | types.Theme[]
  pageTypes?: types.IPageType[]
  logo?: string
  loginUI?: LoginUI
  contentClassName?: string
  defaultTheme?: string
  renderLocalLink: types.RenderLocalLink
  navigate: (path: string) => void
  loginPath?: string
  editorPath?: string
  mediaLibraryPath?: string
  playgroundPath?: string
  appSettingsPath?: string
  previewPath?: string
  getAdminMenu?: (args: { isAdmin: boolean }) => IMenuItem[]
  isDarkColorMode?: boolean
  toggleColorMode?: () => void
  useCssInJs?: boolean
  appRootElement: string | HTMLElement
  clickToEditSide?: ClickToEditSide
  customFields?: Array<ISideEditPropPage | ISideGroup>
  responsiveBreakpoints?: ResponsiveBreakpoint[]
  enableAutoSave?: boolean
  disableSaveIfInvalidProps?: boolean
  enablePreview?: boolean
  blockIconsPosition?: BlockIconsPosition
  enablePreviewImage?: boolean
  enablePreviewIcon?: boolean
  enableUnsplash?: boolean
  unsplashApiKey?: string
  enableDefaultEmbedBrick?: boolean
  permissions?: Permissions
  allowAccentsInSlugs?: boolean
}

ResponsiveBreakpoint
interface ResponsiveBreakpoint {
  type: DeviceType
  width: number | string
  label: string
}

UsePagesType
interface UsePagesType {
  <T extends boolean>({
    type,
    types,
    tag,
    language,
    page,
    pageSize,
    sort,
    filterBy,
    usePagination,
  }: {
    type?: string
    types?: string[]
    tag?: string
    language: string
    page?: number
    pageSize?: number
    sort?: string
    filterBy?: { [key: string]: any }
    usePagination: T
  }): UseQueryResult<
    T extends true ? types.PagesFromListWithPagination : types.PageFromList[],
    unknown
  >
  ({
    type,
    types,
    tag,
    language,
    page,
    pageSize,
    sort,
    filterBy,
  }: {
    type?: string
    types?: string[]
    language: string
    tag?: string
    page?: number
    pageSize?: number
    sort?: string
    filterBy?: { [key: string]: any }
  }): UseQueryResult<types.PageFromList[], unknown>
  (): UseQueryResult<types.PageFromList[], unknown>
}

UsePagesPublicType
interface UsePagesPublicType {
  <T extends boolean>({
    type,
    types,
    tag,
    language,
    page,
    pageSize,
    sort,
    filterBy,
    usePagination,
  }: {
    type?: string
    types?: string[]
    tag?: string
    language?: string
    page?: number
    pageSize?: number
    sort?: string
    filterBy?: { [key: string]: any }
    usePagination: T
  }): UseQueryResult<
    T extends true ? types.PagesFromListWithPagination : types.PageFromList[],
    unknown
  >
  ({
    type,
    types,
    tag,
    language,
    page,
    pageSize,
    sort,
    filterBy,
  }: {
    type?: string
    types?: string[]
    tag?: string
    language?: string
    page?: number
    pageSize?: number
    sort?: string
    filterBy?: { [key: string]: any }
  }): UseQueryResult<types.PageFromList[], unknown>
  (): UseQueryResult<types.PageFromList[], unknown>
}
