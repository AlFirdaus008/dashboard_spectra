import type {FeatureCollection, Feature, Polygon, MultiPolygon} from 'geojson';
export type Properties = Record<string, string | number | boolean | null> & {grid_id:string; recommendation_level:number; screening_target:boolean};
export type Grid = Feature<Polygon | MultiPolygon, Properties>;
export type Collection = FeatureCollection<Polygon | MultiPolygon, Properties>;
export type Metadata = {contract:{contract_name:string;required_disclaimer:string;popup_fields:string[];filter_fields:string[];legend:{recommendation_level:number;code:string;label:string;interpretation:string}[]};aliases:Record<string,string>;counts:{total:number;targets:number;reference:number;levels:Record<string,number>};bounds:[number,number,number,number];files:{all:string;targets:string};options:Record<string,string[]>;gate:Record<string,unknown>;qa:Record<string,unknown>;claims:{claim_id:string;claim:string;status:string;reason:string}[];manifest:{file_name:string;sha256:string}[]};
