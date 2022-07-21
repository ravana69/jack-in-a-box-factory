"use strict";
console.clear();
TweenMax.lagSmoothing(0);
THREE.ImageUtils.crossOrigin = '';
let colors = {
    blue: '#4281A4',
    green: '#48A9A6',
    background: '#D0CBC7',
    ground: '#E4DFDA',
    yellow: '#D4B483',
    red: '#C1666B',
    lid: '#B05D62',
    skin: '#F5D6BA'
};
let settings = {
    openSpeed: 0.8
};
let Utils = {
    degToRad: function (degrees) {
        return degrees * Math.PI / 180;
    }
};
class Stage {
    constructor() {
        // container
        this.render = function () {
            this.renderer.render(this.scene, this.camera);
        };
        this.add = function (elem) {
            this.scene.add(elem);
        };
        this.remove = function (elem) {
            this.scene.remove(elem);
        };
        this.container = document.createElement('div');
        document.body.appendChild(this.container);
        // renderer
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: false
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(colors.background, 1);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.container.appendChild(this.renderer.domElement);
        // scene
        this.scene = new THREE.Scene();
        //this.scene.fog = new THREE.Fog( colors.ground, 0, 10);
        // camera
        let aspect = window.innerWidth / window.innerHeight;
        let d = 20;
        this.camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, -100, 1000);
        this.camera.position.x = 30;
        this.camera.position.y = 10;
        this.camera.position.z = -10;
        this.camera.lookAt(new THREE.Vector3(0, 5, 0));
        //light
        this.light = new THREE.DirectionalLight(0xffffff, 0.5);
        this.light.castShadow = true;
        this.light.position.set(8, 15, -5);
        this.scene.add(this.light);
        this.softLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(this.softLight);
        // floor
        var width = 500;
        var depth = 1000;
        var geometry = new THREE.PlaneGeometry(depth, width);
        var material = new THREE.MeshBasicMaterial({
            color: colors.ground,
            shading: THREE.FlatShading
        });
        var plane = new THREE.Mesh(geometry, material);
        plane.rotation.x = -Utils.degToRad(90); //1.57079633;
        plane.position.y = 0;
        plane.position.z = -width / 2;
        this.floor = new THREE.Group();
        this.floor.add(plane);
        this.scene.add(this.floor);
        // group
        this.group = new THREE.Group();
        this.scene.add(this.group);
    }
}
class Box {
    constructor() {
        this.openAnimation = new TimelineMax();
        this.closeAnimation = new TimelineMax();
        this.dropAnimation = new TimelineMax();
        this.fallAnimation = new TimelineMax();
        this.setAnimation = function () {
            var speed = 1;
            var boxBounceSpeed = speed / 3;
            this.openAnimation.clear();
            this.openAnimation.stop();
            this.openAnimation.to(this.group.position, boxBounceSpeed, {
                y: 4,
                delay: 0,
                ease: Power2.easeInOut
            });
            this.openAnimation.to(this.group.position, boxBounceSpeed * 2, {
                y: 0,
                x: 0,
                z: 0,
                ease: Bounce.easeOut
            });
            this.openAnimation.to(this.lid.rotation, speed, {
                z: 2,
                ease: Bounce.easeOut
            }, 0);
            this.openAnimation.to(this.crank.rotation, speed * 3, {
                z: Utils.degToRad(180),
                ease: Elastic.easeOut
            }, 0);
            // -----
            this.crankSpeed = 0;
            this.crankAnimation = setInterval(() => { this.moveCrank(); }, 20);
            // -----
            this.dropAnimation.clear();
            this.dropAnimation.stop();
            this.dropAnimation.to(this.group.position, 1, { y: 0, delay: 0.5, ease: Bounce.easeOut });
            // -----
            this.fallAnimation.clear();
            this.fallAnimation.stop();
            this.fallAnimation.to(this.group.position, 1, { y: -20, delay: 0, ease: Power3.easeIn });
            this.fallAnimation.to(this.group.rotation, 1, { x: Utils.degToRad(120), delay: 0, ease: Power3.easeIn }, 0);
        };
        this.moveCrank = function () {
            if (this.closed) {
                this.crank.rotation.z = this.crank.rotation.z > Utils.degToRad(360) ? 0 : this.crank.rotation.z + this.crankSpeed;
                if (this.crankSpeed < 0.1)
                    this.crankSpeed += 0.005;
            }
        };
        this.add = function (elem) {
            this.group.add(elem);
        };
        this.stopAnimations = function () {
            this.openAnimation.stop();
            this.closeAnimation.stop();
        };
        this.open = function (skipAnimation = false) {
            this.closed = false;
            //this.stopAnimations();
            this.openAnimation.duration(skipAnimation ? 0.1 : 3);
            this.openAnimation.restart();
        };
        this.close = function () {
            this.closed = true;
            //this.stopAnimations();
            this.closeAnimation.duration(3);
            this.closeAnimation.restart();
        };
        this.drop = function (skipAnimation = false) {
            this.dropAnimation.duration(skipAnimation ? 0.1 : 1);
            this.dropAnimation.restart();
        };
        this.fall = function (skipAnimation = false) {
            this.fallAnimation.duration(skipAnimation ? 0.1 : 1);
            this.fallAnimation.restart();
        };
        this.closed = true;
        this.group = new THREE.Group();
        var material = new THREE.MeshToonMaterial({
            color: colors.red
        });
        var geometry = new THREE.BoxGeometry(4, 1, 4);
        var boxBottom = new THREE.Mesh(geometry, material);
        boxBottom.position.y = 0.5;
        //boxBottom.castShadow = true;
        //boxBottom.receiveShadow = true;
        var geometry = new THREE.BoxGeometry(6, 1, 6);
        var boxBack = new THREE.Mesh(geometry, material);
        boxBack.position.y = 2.5;
        boxBack.position.x = -2.5;
        boxBack.rotation.z = Utils.degToRad(90);
        //boxBack.castShadow = true;
        //boxBack.receiveShadow = true;
        var geometry = new THREE.BoxGeometry(6, 1, 6);
        var boxFront = new THREE.Mesh(geometry, material);
        boxFront.position.y = 2.5;
        boxFront.position.x = 2.5;
        boxFront.rotation.z = Utils.degToRad(90);
        //boxFront.castShadow = true;
        //boxFront.receiveShadow = true;
        var geometry = new THREE.BoxGeometry(4, 1, 6);
        var boxLeft = new THREE.Mesh(geometry, material);
        boxLeft.position.y = 2.5;
        boxLeft.position.z = 2.5;
        boxLeft.rotation.x = Utils.degToRad(90);
        //boxLeft.castShadow = true;
        //boxLeft.receiveShadow = true;
        var geometry = new THREE.BoxGeometry(4, 1, 6);
        var boxRight = new THREE.Mesh(geometry, material);
        boxRight.position.y = 2.5;
        boxRight.position.z = -2.5;
        boxRight.rotation.x = Utils.degToRad(90);
        //boxRight.castShadow = true;
        //boxRight.receiveShadow = true;
        var geometry = new THREE.BoxGeometry(6, 1.75, 6);
        geometry.applyMatrix(new THREE.Matrix4().makeTranslation(3, 1, 0));
        var material = new THREE.MeshToonMaterial({
            color: colors.lid
        });
        this.lid = new THREE.Mesh(geometry, material);
        this.lid.position.y = 5.4;
        this.lid.position.x = -3;
        //this.lid.castShadow = true;
        //this.lid.receiveShadow = true;
        this.group.add(this.lid);
        this.group.add(boxBottom);
        this.group.add(boxBack);
        this.group.add(boxLeft);
        this.group.add(boxRight);
        this.group.add(boxFront);
        this.crank = new THREE.Group();
        var geometry = new THREE.CylinderGeometry(0.3, 0.3, 0.6, 8);
        var material = new THREE.MeshToonMaterial({
            color: colors.yellow
        });
        var axel = new THREE.Mesh(geometry, material);
        axel.rotation.x = Utils.degToRad(90);
        //axel.castShadow = true;
        //axel.receiveShadow = true;
        var geometry = new THREE.BoxGeometry(1, 0.3, 3, 8);
        var material = new THREE.MeshToonMaterial({
            color: colors.yellow
        });
        var shaft = new THREE.Mesh(geometry, material);
        shaft.position.y = 1;
        shaft.rotation.x = Utils.degToRad(90);
        //shaft.castShadow = true;
        //shaft.receiveShadow = true;
        var geometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 8);
        var material = new THREE.MeshToonMaterial({
            color: colors.yellow
        });
        var handle = new THREE.Mesh(geometry, material);
        handle.position.z = -0.6;
        handle.position.y = 2;
        handle.rotation.x = Utils.degToRad(90);
        //handle.castShadow = true;
        //handle.receiveShadow = true;
        this.crank.add(axel);
        this.crank.add(shaft);
        this.crank.add(handle);
        this.crank.position.z = -3.5;
        this.crank.position.y = 3.5;
        this.crank.rotation.z = Utils.degToRad(Math.random() * 360);
        this.group.add(this.crank);
        this.group.position.y = 20;
        this.setAnimation();
    }
}
class Jack {
    constructor(color, face) {
        this.openAnimation = new TimelineMax();
        this.closeAnimation = new TimelineMax();
        this.moveAnimation = new TimelineMax();
        this.setAnimation = function () {
            var speed = 1;
            // open animation
            this.openAnimation.clear();
            this.openAnimation.stop();
            var jackDelay = 0.2;
            this.openAnimation.to(this.group.position, speed * 2, {
                y: 5,
                ease: Elastic.easeOut
            }, jackDelay);
            this.openAnimation.to(this.leftHand.position, speed * 2, {
                z: -2.1,
                y: 3.8,
                ease: Elastic.easeOut
            }, jackDelay);
            this.openAnimation.to(this.rightHand.position, speed * 2, {
                z: 2.1,
                y: 3.8,
                ease: Elastic.easeOut
            }, jackDelay);
            this.openAnimation.to(this.group.rotation, speed / 3, {
                x: Math.random() - 0.5,
                z: Math.random() - 0.5,
                ease: Power3.easeInOut
            }, jackDelay);
            this.openAnimation.to(this.group.rotation, speed * 4, {
                x: 0,
                z: (Math.random() / 10) - 0.1,
                ease: Elastic.easeOut
            }, speed / 3);
            this.openAnimation.to(this.head.position, speed * 3, {
                y: 6,
                ease: Elastic.easeOut
            }, jackDelay);
            // move animation
            this.moveAnimation.clear();
            this.moveAnimation.stop();
            this.moveAnimation.to(this.group.rotation, 0.6, {
                x: -0.5,
                ease: Power3.easeIn
            }, 0);
            this.moveAnimation.to(this.group.rotation, speed * 2, {
                x: 0,
                ease: Elastic.easeOut
            });
        };
        this.stopAnimations = function () {
            this.openAnimation.pause();
            this.closeAnimation.pause();
            this.moveAnimation.pause();
        };
        this.open = function (skipAnimation = false) {
            this.openAnimation.duration(skipAnimation ? 0.1 : 3);
            this.openAnimation.restart();
        };
        this.close = function () {
            //this.stopAnimations();
            //this.closeAnimation.duration(6);
            this.closeAnimation.restart();
        };
        this.move = function (speed) {
            this.moveAnimation.restart();
        };
        this.group = new THREE.Group();
        var geometry = new THREE.CylinderGeometry(1.1, 1.3, 2.5, 15);
        var material = new THREE.MeshToonMaterial({
            color: color
        });
        this.body = new THREE.Mesh(geometry, material);
        this.body.position.y = 2.5;
        //this.body.castShadow = true;
        //this.body.receiveShadow = true;
        var material = new THREE.MeshToonMaterial({
            color: colors.skin,
            map: face
        });
        var geometry = new THREE.SphereGeometry(1.7, 32, 32);
        this.head = new THREE.Mesh(geometry, material);
        this.head.position.y = 4;
        //this.head.castShadow = true;
        //this.head.receiveShadow = true;
        var material = new THREE.MeshToonMaterial({
            color: colors.skin
        });
        var geometry = new THREE.SphereGeometry(0.5, 32, 32);
        this.leftHand = new THREE.Mesh(geometry, material);
        this.leftHand.position.z = -1.5;
        this.leftHand.position.y = 2;
        //this.leftHand.castShadow = true;
        //this.leftHand.receiveShadow = true;
        var geometry = new THREE.SphereGeometry(0.5, 32, 32);
        this.rightHand = new THREE.Mesh(geometry, material);
        this.rightHand.position.z = 1.5;
        this.rightHand.position.y = 2;
        //this.rightHand.castShadow = true;
        //this.rightHand.receiveShadow = true;
        this.group.add(this.body);
        this.group.add(this.head);
        this.group.add(this.leftHand);
        this.group.add(this.rightHand);
        this.setAnimation();
    }
}
class Dispenser {
    constructor() {
        this.openAnimation = new TimelineMax();
        this.setAnimation = function () {
            this.openAnimation.clear();
            this.openAnimation.stop();
            this.openAnimation.fromTo(this.lidRight.rotation, 1, { x: Utils.degToRad(0) }, { delay: 0.3, x: Utils.degToRad(-90), ease: Elastic.easeOut }, 0);
            this.openAnimation.fromTo(this.lidLeft.rotation, 1, { x: Utils.degToRad(0) }, { delay: 0.3, x: Utils.degToRad(90), ease: Elastic.easeOut }, 0);
            this.openAnimation.fromTo(this.lidRight.rotation, 0.5, { x: Utils.degToRad(-90) }, { x: Utils.degToRad(0), ease: Power3.easeInOut }, 1.5);
            this.openAnimation.fromTo(this.lidLeft.rotation, 0.5, { x: Utils.degToRad(90) }, { x: Utils.degToRad(0), ease: Power3.easeInOut }, 1.5);
        };
        this.open = function () {
            this.openAnimation.restart();
        };
        this.group = new THREE.Group();
        var geometry = new THREE.BoxGeometry(10, 30, 10);
        geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, 15, 0));
        var material = new THREE.MeshToonMaterial({
            color: '#eeeeee'
        });
        this.tube = new THREE.Mesh(geometry, material);
        this.group.add(this.tube);
        var geometry = new THREE.BoxGeometry(10, 1, 5);
        geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, -0.5, 2.5));
        var material = new THREE.MeshToonMaterial({
            color: '#dddddd'
        });
        this.lidLeft = new THREE.Mesh(geometry, material);
        this.group.add(this.lidLeft);
        var geometry = new THREE.BoxGeometry(10, 1, 5);
        geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, -0.5, -2.5));
        var material = new THREE.MeshToonMaterial({
            color: '#dddddd'
        });
        this.lidRight = new THREE.Mesh(geometry, material);
        this.group.add(this.lidRight);
        this.lidLeft.position.z = -5;
        this.lidLeft.rotation.x = Utils.degToRad(90);
        this.lidRight.position.z = 5;
        this.lidRight.rotation.x = Utils.degToRad(-90);
        this.setAnimation();
    }
}
class App {
    constructor(count = 5) {
        this.time = 2.5;
        this.count = 0;
        this.tick = function () {
            this.stage.render();
            requestAnimationFrame(() => { this.tick(); });
        };
        this.addJack = function (skipAnimation = false) {
            let jack = new Jack(this.colorChoices[Math.floor(Math.random() * this.colorChoices.length)], this.face);
            let box = new Box();
            let group = new THREE.Group();
            group.position.z = Math.floor(this.count / 2) * -15;
            box.add(jack.group);
            group.add(box.group);
            this.jacks.push({ box: box, jack: jack, group: group });
            this.stage.add(group);
            box.drop(skipAnimation);
            this.dispenser.open();
        };
        this.move = function (skipAnimation = false) {
            while (this.jacks.length >= this.count) {
                let removed = this.jacks.shift();
                if (removed)
                    this.stage.remove(removed.group);
            }
            for (let i = this.jacks.length - 1; i >= 0; i--) {
                if (this.jacks[i]) {
                    var box = this.jacks[i].box;
                    var jack = this.jacks[i].jack;
                    var group = this.jacks[i].group;
                    if (!box.closed)
                        this.jacks[i].jack.move(2.2);
                    if (i <= Math.floor(this.count / 2) && box.closed) {
                        if (i != Math.floor(this.count / 2)) {
                            this.jacks[i].box.open(true);
                            this.jacks[i].jack.open(true);
                        }
                        else
                            setTimeout(() => {
                                this.jacks[i].box.open();
                                this.jacks[i].jack.open();
                            }, 1000);
                    }
                    if (i == 0) {
                        this.jacks[i].box.fall(skipAnimation);
                    }
                    TweenMax.to(group.position, skipAnimation ? 0 : 1, { z: (Math.floor(this.count / 2) - i) * 15, ease: Power3.easeInOut });
                    //TweenMax.to(this.beltTexture.offset, skipAnimation ? 0 : 1, {y: '+=0.5', ease:Power3.easeInOut});
                }
            }
            this.addJack();
            setTimeout(() => { this.move(); }, this.time * 1000);
        };
        this.count = count;
        this.jacks = [];
        this.face = THREE.ImageUtils.loadTexture('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAtAAAAEACAYAAACagUEuAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAABV0RVh0Q3JlYXRpb24gVGltZQAxMy80LzE2VqbobgAAABx0RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzIENTNui8sowAAA9LSURBVHic7d1diJV1HsDx33Ne5oyjzoyao07DZI0ppr3Q5q7NhLAv7GIUXRRtS0Et3iQFJd0s1LJEsUXUxlbQTSzsRQlLu8su7G53UoZ2ERFmEBm0ma69aNOWk6bjnL0ol7AX5+885zznnPl8QATl/P4/Fc58fXjmOVm9Xq8HAAAwLaWiFwAAgHYioAEAIIGABgCABAIaAAASCGgAAEggoAEAIIGABgCABAIaAAASCGgAAEggoAEAIIGABgCABAIaAAASCGgAAEggoAEAIIGABgCABAIaAAASCGgAAEggoAEAIIGABgCABAIaAAASCGgAAEggoAEAIIGABgCABAIaAAASCGgAAEggoAEAIIGABgCABAIaAAASCGgAAEggoAEAIIGABgCABAIaAAASCGgAAEggoAEAIIGABgCABAIaAAASCGgAAEggoAEAIIGABgCABAIaAAASCGgAAEggoAEAIIGABgCABAIaAAASCGgAAEggoAEAIIGABgCABAIaAAASCGgAAEggoAEAIIGABgCABAIaAAASCGgAAEggoAEAIIGABgCABAIaAAASCGgAAEggoAEAIIGABgCABAIaAAASCGgAAEggoAEAIIGABgCABAIaAAASCGgAAEggoAEAIIGABgCABAIaAAASCGgAAEggoAEAIIGABgCABAIaAAASCGgAAEggoAEAIIGABgCABAIaAAASCGgAAEggoAEAIEGl6AUAWt3k5GTs3LkzduzYEbt27Yp9+/bFxMRERET09PTE0NBQrF27NsbGxmJ0dDSq1WrBG3/h6NGj8cILL8SOHTvijTfeiH379sXRo0cjIqK3tzeGh4fjwgsvjA0bNsT3vve9KJVcUwGYjqxer9eLXgKgFR07diy2bt0azzzzTBw6dGhar+nv74+bbropbrjhhuju7m7wht/sk08+iT/+8Y/x7LPP/j/0T2fZsmXxy1/+Mq655pool8sN3hCgvQlogG/w6quvxm9+85vYv3//Gb1+2bJlce+998all16a82bfbdu2bfHb3/42xsfHz+j1K1eujPvuuy9GRkZy3gygcwhogFP89a9/jQceeCCmpqZmNKdUKsVdd90VP//5z3Pa7NvV6/V48skn4w9/+MOMZ9Vqtbj//vvjhz/8YQ6bAXQeAQ3wFX/605/ioYceynXmli1b4sYbb8x15ql+97vfxTPPPJPbvFKpFA8++GD86Ec/ym0mQKfwHSMAX3rppZfi4Ycfzn3uo48+Gi+88ELuc0/685//nGs8R0RMTU3FPffcE2+++WaucwE6gSvQAPHFN95dd9118dFHHzVkfm9vb/zlL3+J/v7+XOfu3bs3brjhhjh27Fiuc09avnx5bN26tWWeLALQClyBBoiIp556qmHxHPFFoD/55JO5z3300UcbFs8REf/+979j69atDZsP0I4ENDDrjY+Px7PPPtvwc/72t7/Fhx9+mNu8N998M7Zv357bvG/z9NNPNzTSAdqNgAZmveeee64pgTg5ORn/+te/cpv397//PbdZ3+XQoUPx4osvNuUsgHYgoIFZrxlXcU96/vnnW3LW6TTymyAB2o2ABma1er0er732WtPOe/311+PEiRMznnPw4ME4cOBADhtNz65du5p2FkCrE9DArHbw4ME4cuRI086bnJw84083/Kp33nknh22mb9++fTE5OdnUMwFalYAGZrUz/cjrmfj0009nPOOTTz7JYZPpm5qais8++6ypZwK0KgEN0GR53MIx048ZPxN57A3QCQQ0MKvNnTu36WfOmzdvxjN6enpy2KT1zwRoRQIamNWWLFkS5XK5aedlWRZnn332jOcMDw/nsM30DQwMRK1Wa+qZAK1KQAOzWqVSiZUrVzbtvJGRkVxCdNmyZdHX15fDRtOzevXqpp0F0OoENDDrXXHFFU07a3R0NJc5pVIp1q9fn8us6RgbG2vaWQCtTkADs97GjRsjy7KmnHXVVVe15Kzv0tXVFT/5yU+achZAOxDQwKw3PDwcGzZsaPg5o6Ojcd555+U2b/369U25/eTaa6+N3t7ehp8D0C4ENEBE3HHHHdHV1dWw+eVyOe68885cZ2ZZFlu2bMl15ql6e3tj06ZNDT0DoN0IaID44ir07bff3rD5mzdvzvXq80nr1q2L66+/Pve5J919993R39/fsPkA7UhAA3zpF7/4RVx99dW5z/3pT38aN998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');
        //this.beltTexture = THREE.ImageUtils.loadTexture('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAo0lEQVQ4T92SOw7EIAxEbYlAGhoUag7CJbhDLsCpU6RKRxE+K7wbqqzcQ2MhzYzFY9A51+B31nUFa+1z/TtzznAcByAiIACMANb5IpghQGs9GCilYNs2FsV933CeJ+kwxkgBrTUQQrDmR1BrJc8MEL33xKC/qTfRGMNyKKUQRGpiCGFAlFKC1poN6Muu6/r+wgRV3vd9NLEXaVkWlkEXpJRI9wF2LD6fpIaHQwAAAABJRU5ErkJggg==');
        this.colorChoices = [colors.blue]; //, colors.green, colors.yellow];
        this.stage = new Stage();
        this.stage.floor.position.z = (Math.floor(this.count / 2) * 15) - 8;
        this.stage.floor.position.y = -1.5;
        this.dispenser = new Dispenser();
        this.dispenser.group.position.y = 16;
        this.dispenser.group.position.z = Math.floor(this.count / 2) * -15;
        this.stage.add(this.dispenser.group);
        var width = this.count * 20;
        var depth = 30;
        var geometry = new THREE.PlaneGeometry(depth, width);
        var material = new THREE.MeshBasicMaterial({
            color: '#777777',
            shading: THREE.FlatShading,
            //map: this.beltTexture
        });
        //this.beltTexture.repeat.y = 100;
        //this.beltTexture.wrapS = this.beltTexture.wrapT = THREE.RepeatWrapping;
        //this.beltTexture.repeat.set( depth / 8, width / 8 );
        var plane = new THREE.Mesh(geometry, material);
        plane.rotation.x = -Utils.degToRad(90); //1.57079633;
        plane.position.y = -1;
        plane.position.z = -width / 2;
        this.belt = new THREE.Group();
        this.belt.add(plane);
        this.stage.add(this.belt);
        this.belt.position.z = -Math.floor(this.count / 2) * -11;
        this.tick();
        while (this.jacks.length < this.count) {
            this.addJack(true);
        }
        this.move(true);
    }
}
let app = new App(5);