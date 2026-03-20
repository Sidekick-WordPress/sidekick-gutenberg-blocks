// src/models/namespace.ts
import cfg from '../namespace.json';

// We explicitly cast or read strictly to ensure 'ns' is a string
const namespace: string = cfg.ns;

export default namespace;
