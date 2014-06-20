'use strict';


/*
Determine if line segments a0-a1 and b0-b1 intersect. If so, return the point of
intersection. Else, return null.
Expects segments {x0, y0, x1, y1}
*/
function segments_intersect(seg0, seg1) {
	var seg0x, seg0y, seg1x, seg1y;
	var s, t;

	// Segment lengths
	seg0x = seg0.x1 - seg0.x0;
	seg0y = seg0.y1 - seg0.y0;
	seg1x = seg1.x1 - seg1.x0;
	seg1y = seg1.y1 - seg1.y0;

	// Magic
	s = (-seg0y * (seg0.x0 - seg1.x0) + seg0x * (seg0.y0 - seg1.y0)) / (-seg1x * seg0y + seg0x * seg1y);
	t = ( seg1x * (seg0.y0 - seg1.y0) - seg1y * (seg0.x0 - seg1.x0)) / (-seg1x * seg0y + seg0x * seg1y);

	if(s >= 0 && s <= 1 && t >= 0 && t <= 1) {
		// Collision; return point of intersection
		return {x: seg0.x0 + (t * seg0x), y: seg0.y0 + (t * seg0y)};
	} else {
		// No collision; return null
		return null;
	}
}


/*
Determine distance from a point to a line segment
Expects point {x, y}, segment {x0, y0, x1, y1}
*/
function point_to_segment(p, seg) {
	return Math.sqrt(point_to_segment_sqr(p, seg));
}


/*
Determine distance from a point to a line segment, squared
Expects point {x, y}, segment {x0, y0, x1, y1}
*/
function point_to_segment_sqr(p, seg) {
	var length_sqr, perc;
	var seg_p0 = {x: seg.x0, y: seg.y0};
	var seg_p1 = {x: seg.x1, y: seg.y1};

	length_sqr = point_to_point_sqr(seg_p0, seg_p1);
	perc = ((p.x-seg.x0) * (seg.x1-seg.x0) + (p.y-seg.y0) * (seg.y1-seg.y0)) / length_sqr;

	if(perc < 0) {
		return point_to_point_sqr(p, seg_p0);
	} else if(perc > 1) {
		return point_to_point_sqr(p, seg_p1);
	} else {
		var tx, ty;
		tx = seg.x0 + perc * (seg.x1-seg.x0);
		ty = seg.y0 + perc * (seg.y1-seg.y0);
		return point_to_point_sqr(p, {x: tx, y: ty});
	}
}


/*
Determine distance from a point to a point
Expects points {x, y}
*/
function point_to_point(p0, p1) {
	return Math.sqrt(point_to_point_sqr(p0, p1));
}


/*
Determine distance from a point to a point, squared
Expects points {x, y}
*/
function point_to_point_sqr(p0, p1) {
	var dist_x, dist_y;

	dist_x = p0.x - p1.x;
	dist_y = p0.y - p1.y;
	return dist_x*dist_x + dist_y*dist_y;
}
