import { Document } from '@contentful/rich-text-types';

export interface ContentfulResourceEntry {
    metadata: {
        tags: any[];
        concepts: any[];
    };
    sys: {
        space: {
            sys: {
                type: 'Link';
                linkType: 'Space';
                id: string;
            };
        };
        id: string;
        type: 'Entry';
        createdAt: string;
        updatedAt: string;
        environment: {
            sys: {
                id: string;
                type: 'Link';
                linkType: 'Environment';
            };
        };
        publishedVersion: number;
        revision: number;
        contentType: {
            sys: {
                type: 'Link';
                linkType: 'ContentType';
                id: string;
            };
        };
        locale: string;
    };
    fields: {
        title: string;
        description: string;
        type: string;
        content: Document;
        image: {
            metadata: {
                tags: any[];
                concepts: any[];
            };
            sys: {
                space: {
                    sys: {
                        type: 'Link';
                        linkType: 'Space';
                        id: string;
                    };
                };
                id: string;
                type: 'Asset';
                createdAt: string;
                updatedAt: string;
                environment: {
                    sys: {
                        id: string;
                        type: 'Link';
                        linkType: 'Environment';
                    };
                };
                publishedVersion: number;
                revision: number;
                locale: string;
            };
            fields: {
                title: string;
                description: string;
                file: {
                    url: string;
                    details: {
                        size: number;
                        image: {
                            width: number;
                            height: number;
                        };
                    };
                    fileName: string;
                    contentType: string;
                };
            };
        };
        datePosted: string; // ISO 8601 with timezone offset
        readTime: number;
        tags: string;
        slug: string;
    };
}

export interface RichTextDocument {
    data: Record<string, unknown>;
    content: RichTextNode[];
    nodeType: 'document';
}

export interface RichTextNode {
    data: Record<string, unknown>;
    content?: RichTextNode[];
    marks?: { type: string }[];
    value?: string;
    nodeType:
        | 'document'
        | 'paragraph'
        | 'heading-1'
        | 'heading-2'
        | 'heading-3'
        | 'unordered-list'
        | 'ordered-list'
        | 'list-item'
        | 'hr'
        | 'text';
}
