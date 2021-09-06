const router = require('express').Router();
const { StatusCodes } = require('http-status-codes');
const Project = require('../../model/project');
const { ensureLoggedIn, ensureAdminOr } = require('../auth/middlewares');
const { resolveRecord } = require('../common/middlewares');
const pdb = require('./project.db');
const sdb = require('../sheet/sheet.db');

router.delete('/project/:id',
	ensureLoggedIn,
	resolveRecord(req => req.params.id, pdb.findById, 'project'),
	ensureAdminOr(req => req.project.userId === req.user.id),
	async (req, res) => {
		await pdb.del(req.params.id);
		res.json({});
	});

router.get('/projects',
	ensureLoggedIn,
	async (req, res) => {
		const projects = req.user.isAdmin
			? await pdb.findAll()
			: await pdb.findByUserId(req.user.id);
		res.json(projects);
	});

router.get('/project/:id',
	resolveRecord(req => req.params.id, pdb.findById, 'project'),
	async (req, res) => {
		req.project.sheets = await sdb.findByProjectId(req.project.id);
		res.json(req.project);
	});

router.patch('/project',
	ensureLoggedIn,
	resolveRecord(req => req.body.id, pdb.findById, 'project'),
	ensureAdminOr(req => req.project.userId === req.user.id),
	async (req, res) => {
		const changes = req.body;
		if (!req.user.isAdmin) {
			delete changes.userId;
		}

		let project = new Project(Object.assign(req.project, changes));
		if (!project.title) {
			return res.sendStatus(StatusCodes.BAD_REQUEST);
		}
		project.slug = '' + new Date().getTime(); // TODO slugify logic
		await pdb.update(project);

		project = await pdb.findById(project.id);
		res.json(project);
	});

router.put('/project',
	ensureLoggedIn,
	async (req, res) => {
		let project = new Project(req.body);
		if (!project.title) {
			return res.sendStatus(StatusCodes.BAD_REQUEST);
		}
		if (!project.userId || !req.user.isAdmin) {
			project.userId = req.user.id;
		}
		project.slug = '' + new Date().getTime(); // TODO slugify logic

		const id = await pdb.create(project);
		project = await pdb.findById(id);

		res.json(project);
	});

module.exports = router;
